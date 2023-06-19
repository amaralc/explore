# This block sets up what backend should be used for Terraform. In this case, we are using Google Cloud Storage.
terraform {
  backend "gcs" {                            # The Google Cloud Storage backend
    bucket      = "peerlab-platform-tfstate" # The name of the bucket to store the state file
    credentials = "credentials.json"         # The path to the JSON key file for the Service Account Terraform will use to manage its state
    prefix      = "experimental"             # The path to the state file within the bucket
  }
}
