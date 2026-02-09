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

# Install provider-kubernetes via kubectl to avoid plan-time CRD validation.
# kubernetes_manifest validates GVK at plan time, but the Provider CRD only
# exists after the Helm release installs Crossplane.
resource "null_resource" "provider_kubernetes" {
  triggers = {
    context_flag = var.kubeconfig_context != "" ? "--context=${var.kubeconfig_context}" : ""
  }

  provisioner "local-exec" {
    command = <<-EOT
      kubectl apply ${var.kubeconfig_context != "" ? "--context=${var.kubeconfig_context}" : ""} -f - <<'YAML'
      apiVersion: pkg.crossplane.io/v1
      kind: Provider
      metadata:
        name: provider-kubernetes
      spec:
        package: "xpkg.upbound.io/crossplane-contrib/provider-kubernetes:${var.provider_kubernetes_version}"
      YAML
    EOT
  }

  provisioner "local-exec" {
    when    = destroy
    command = "kubectl delete provider provider-kubernetes ${self.triggers.context_flag} --ignore-not-found || true"
  }

  depends_on = [helm_release.crossplane]
}

# Wait for provider-kubernetes CRDs and health before creating ProviderConfig.
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

  depends_on = [null_resource.provider_kubernetes]
}

# Grant cluster-admin to provider-kubernetes so it can manage
# arbitrary resources (StatefulSets, Services, etc.) in any namespace.
# The SA name is dynamic (based on provider revision), so we discover it at runtime.
resource "null_resource" "provider_kubernetes_rbac" {
  triggers = {
    context_flag = var.kubeconfig_context != "" ? "--context=${var.kubeconfig_context}" : ""
  }

  provisioner "local-exec" {
    command = <<-EOT
      SA_NAME=$(kubectl get sa -n ${local.crossplane_namespace} \
        ${var.kubeconfig_context != "" ? "--context=${var.kubeconfig_context}" : ""} \
        -o jsonpath='{.items[*].metadata.name}' \
        | tr ' ' '\n' | grep provider-kubernetes | head -1)
      if [ -z "$SA_NAME" ]; then
        echo "ERROR: No provider-kubernetes service account found in ${local.crossplane_namespace}" >&2
        exit 1
      fi
      echo "Granting cluster-admin to service account: $SA_NAME"
      kubectl create clusterrolebinding provider-kubernetes-admin \
        --clusterrole=cluster-admin \
        --serviceaccount=${local.crossplane_namespace}:$SA_NAME \
        ${var.kubeconfig_context != "" ? "--context=${var.kubeconfig_context}" : ""} \
        --dry-run=client -o yaml | \
        kubectl apply ${var.kubeconfig_context != "" ? "--context=${var.kubeconfig_context}" : ""} -f -
    EOT
  }

  provisioner "local-exec" {
    when    = destroy
    command = "kubectl delete clusterrolebinding provider-kubernetes-admin ${self.triggers.context_flag} --ignore-not-found || true"
  }

  depends_on = [null_resource.wait_for_provider_kubernetes]
}

# Configure provider-kubernetes with in-cluster identity via kubectl.
# Named "default" so Objects in Compositions don't need explicit providerConfigRef.
resource "null_resource" "provider_kubernetes_config" {
  triggers = {
    context_flag = var.kubeconfig_context != "" ? "--context=${var.kubeconfig_context}" : ""
  }

  provisioner "local-exec" {
    command = <<-EOT
      kubectl apply ${var.kubeconfig_context != "" ? "--context=${var.kubeconfig_context}" : ""} -f - <<'YAML'
      apiVersion: kubernetes.crossplane.io/v1alpha1
      kind: ProviderConfig
      metadata:
        name: default
      spec:
        credentials:
          source: InjectedIdentity
      YAML
    EOT
  }

  provisioner "local-exec" {
    when    = destroy
    command = "kubectl delete providerconfig default ${self.triggers.context_flag} --ignore-not-found || true"
  }

  depends_on = [null_resource.provider_kubernetes_rbac]
}
