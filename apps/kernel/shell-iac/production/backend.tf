# This block sets up what backend should be used for Terraform. In this case, we are using Google Cloud Storage.
terraform {
  backend "gcs" {                                # The Google Cloud Storage backend
    bucket      = "kernel-shell-iac-022-tfstate"      # The name of the bucket to store the state file
    credentials = "credentials.json"             # The path to the JSON key file for the Service Account Terraform will use to manage its state
    prefix      = "production"                   # The path to the state file within the bucket
  }
}
