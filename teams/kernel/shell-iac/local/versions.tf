terraform {
  required_version = ">= 1.1"

  required_providers {
    # --- Active providers (local path) ---
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.0"
    }
    null = {
      source  = "hashicorp/null"
      version = "~> 3.0"
    }
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0"
    }

    # --- Inactive providers (cloud path, count=0) ---
    # Terraform initializes ALL providers in the module tree regardless of
    # count.  These placeholders satisfy that requirement without real
    # credentials -- no cloud resources are planned when environment_type="local".
    google = {
      source = "hashicorp/google"
    }
    google-beta = {
      source = "hashicorp/google-beta"
    }
    neon = {
      source = "kislerdm/neon"
    }
    mongodbatlas = {
      source = "mongodb/mongodbatlas"
    }
    docker = {
      source = "kreuzwerker/docker"
    }
    random = {
      source = "hashicorp/random"
    }
  }
}

# =============================================================================
# Active provider configurations (local path)
# =============================================================================

provider "kubernetes" {
  config_path    = "~/.kube/config"
  config_context = var.minikube_profile
}

provider "helm" {
  kubernetes {
    config_path    = "~/.kube/config"
    config_context = var.minikube_profile
  }
}

# =============================================================================
# Placeholder provider configurations (cloud path, count=0)
# Terraform validates providers at plan time even when no resources use them.
# These use dummy tokens so initialization passes without real credentials.
# =============================================================================

provider "google" {
  access_token = "placeholder"
  project      = "unused"
}

provider "google-beta" {
  access_token = "placeholder"
  project      = "unused"
}

provider "neon" {
  api_key = "placeholder"
}
