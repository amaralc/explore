gcloud projects get-iam-policy peerlab-386017 --format json > iam_policy.json
# jq '.bindings[] | select(.members[] | contains("serviceAccount:SERVICE_ACCOUNT_EMAIL"))' iam_policy.json
# gcloud iam roles describe ROLE_NAME
