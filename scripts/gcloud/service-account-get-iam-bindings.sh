gcloud projects get-iam-policy PROJECT_ID --format json > iam_policy.json
# jq '.bindings[] | select(.members[] | contains("serviceAccount:SERVICE_ACCOUNT_EMAIL"))' iam_policy.json
# gcloud iam roles describe ROLE_NAME
