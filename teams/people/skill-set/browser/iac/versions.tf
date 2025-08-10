terraform {
  required_providers {
    google-beta = {
      source = "hashicorp/google-beta"
    }

    docker = {
      source = "kreuzwerker/docker"
    }

    # # If you use it here you might get caught in a loop of dependencies and provider initialization
    # unleash = {
    #   source = "philips-labs/unleash"
    # }
  }
}
