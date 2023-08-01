terraform {
  required_providers {
    unleash = {
      source  = "philips-labs/unleash"
      version = ">= 0.1.1"
    }
  }
}

provider "unleash" {
  api_url    = var.unleash_api_url
  auth_token = var.unleash_auth_token
}
