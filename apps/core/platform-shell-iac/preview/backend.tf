# This block sets up what backend should be used for Terraform. In this case, we are using Google Cloud Storage.
terraform {
  backend "gcs" {                                   # The Google Cloud Storage backend
    bucket      = "core-platform-shell-iac-tfstate" # The name of the bucket to store the state file
    credentials = "credentials.json"                # The path to the JSON key file for the Service Account Terraform will use to manage its state

    # The prefix will be set as an inline attribute, with 'terraform init -backend-config="prefix=preview-environment-name"'
    prefix = "feature-peer-567-add-iam-service-with-keycloak"
  }
}
