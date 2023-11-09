terraform {
  required_providers {
    google-beta = {
      source = "hashicorp/google-beta"
    }

    docker = {
      source = "kreuzwerker/docker"
    }

    unleash = {
      source = "philips-labs/unleash"
    }
  }
}
