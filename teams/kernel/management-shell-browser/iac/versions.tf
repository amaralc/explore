terraform {
  required_providers {
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "7.19.0"
    }

    docker = {
      source  = "kreuzwerker/docker"
      version = "3.6.2"
    }

    # # If you use it here you might get caught in a loop of dependencies and provider initialization
    # unleash = {
    #   source = "philips-labs/unleash"
    # }
  }
}
