terraform {
  required_providers {
    neon = {
      source  = "kislerdm/neon"
      version = "0.1.0"
    }
  }
}

# Neon DB provider
provider "neon" {
  api_key = var.neon_api_key
}

