terraform {
  required_version = ">= 1.1"

  # Union of all providers from both local and cloud sub-module trees.
  # Root modules must configure each provider; unused ones (count=0 path)
  # can use empty blocks -- Terraform downloads them at init but only
  # calls Configure when a resource actually needs the provider.
  required_providers {
    # --- Local path (kubernetes, helm, null, tls) ---
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

    # --- Cloud path (google, neon, mongodbatlas, docker) ---
    google = {
      source = "hashicorp/google"
    }
    google-beta = {
      source = "hashicorp/google-beta"
    }
    neon = {
      source  = "kislerdm/neon"
      version = "0.13.0"
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
