# This block sets up what backend should be used for Terraform. In this case, we are using Google Cloud Storage.
terraform {
  backend "gcs" {                                # The Google Cloud Storage backend
    bucket = "kernel-shell-iac-103-tfstate"           # The name of the bucket to store the state file
    prefix = "production"                        # The path to the state file within the bucket
    # Authentication uses Application Default Credentials (ADC) from Workload Identity Federation
  }
}
