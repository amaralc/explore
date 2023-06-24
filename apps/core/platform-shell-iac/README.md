# Setup Project

## GCP Project Setup

- (text editor) Define values for `GCP_PROJECT_ID` and `GCP_BILLING_ACCOUNT_ID` variables in `apps/core/platform-shell-iac/project-setup.sh` file;
- (terminal) Run the setup script: `bash apps/core/platform-shell-iac/project-setup.sh`;
- (terminal) Verify that the project was created: `gcloud projects list`;
- (terminal) Verify that the project is linked to the billing account: `gcloud beta billing projects list --billing-account=$GCP_BILLING_ACCOUNT_ID`;
- (terminal) Verify the roles associated with the created service account: `gcloud projects get-iam-policy $GCP_PROJECT_ID --flatten="bindings[].members" --format='table(bindings.role)' --filter="bindings.members:$GCP_SERVICE_ACCOUNT_EMAIL"`;

## Terraform Setup

- (text editor) Verify that `backend.tf` file of this project is pointed to the correct bucket;
  - Note: it is not possible to populate that file using terraform variables;
