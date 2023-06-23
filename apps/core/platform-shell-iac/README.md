# Setup Project

## GCP Project Setup

- (text editor) Edit the `apps/core/platform-shell-iac/project-setup.sh` file and setting the `GCP_PROJECT_ID` and `GCP_BILLING_ACCOUNT_ID` variables;
- (terminal) Run the setup script: `bash apps/core/platform-shell-iac/project-setup.sh`;

## Terraform Setup

- (text editor) Verify that `backend.tf` file of this project is pointed to the correct bucket;
  - Note: it is not possible to populate that file using terraform variables;
