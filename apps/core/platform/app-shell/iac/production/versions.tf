terraform {
  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "0.13.2"
    }
  }
}

# Vercel provider
provider "vercel" {
  api_token = var.vercel_api_token
}
