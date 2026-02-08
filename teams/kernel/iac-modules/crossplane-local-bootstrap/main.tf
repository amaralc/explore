# Crossplane local bootstrap module
# Installs Crossplane via Helm and configures provider-kubernetes
# for managing Kubernetes-native resources through Compositions.

locals {
  crossplane_namespace = "crossplane-system"
}

# Install Crossplane via Helm
resource "helm_release" "crossplane" {
  name             = "crossplane"
  repository       = "https://charts.crossplane.io/stable"
  chart            = "crossplane"
  version          = var.crossplane_version
  namespace        = local.crossplane_namespace
  create_namespace = true
  wait             = true
  timeout          = 600
}

# Install provider-kubernetes
resource "kubernetes_manifest" "provider_kubernetes" {
  manifest = {
    apiVersion = "pkg.crossplane.io/v1"
    kind       = "Provider"
    metadata = {
      name = "provider-kubernetes"
    }
    spec = {
      package = "xpkg.upbound.io/crossplane-contrib/provider-kubernetes:${var.provider_kubernetes_version}"
    }
  }

  depends_on = [helm_release.crossplane]
}

# Wait for provider-kubernetes CRDs and health before creating ProviderConfig.
# The CRD must exist before kubernetes_manifest can apply a ProviderConfig instance.
resource "null_resource" "wait_for_provider_kubernetes" {
  provisioner "local-exec" {
    command = <<-EOT
      echo "Waiting for provider-kubernetes CRDs..."
      kubectl wait --for=condition=Established \
        crd/providerconfigs.kubernetes.crossplane.io \
        --timeout=120s \
        ${var.kubeconfig_context != "" ? "--context=${var.kubeconfig_context}" : ""}
      echo "Waiting for provider-kubernetes to be healthy..."
      kubectl wait --for=condition=Healthy \
        provider/provider-kubernetes \
        --timeout=120s \
        ${var.kubeconfig_context != "" ? "--context=${var.kubeconfig_context}" : ""}
    EOT
  }

  depends_on = [kubernetes_manifest.provider_kubernetes]
}

# Configure provider-kubernetes with in-cluster identity.
# Named "default" so Objects in Compositions don't need explicit providerConfigRef.
resource "kubernetes_manifest" "provider_kubernetes_config" {
  manifest = {
    apiVersion = "kubernetes.crossplane.io/v1alpha1"
    kind       = "ProviderConfig"
    metadata = {
      name = "default"
    }
    spec = {
      credentials = {
        source = "InjectedIdentity"
      }
    }
  }

  depends_on = [null_resource.wait_for_provider_kubernetes]
}
