## Using 1st Generation

Reference: https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/cloudbuild_trigger

- https://cloud.google.com/build/docs/automating-builds/github/connect-repo-github?generation=1st-gen

Needs to manually connect the GitHub.

```
 Error: Error creating Trigger: googleapi: Error 400: Repository mapping does not exist. Please visit https://console.cloud.google.com/cloud-build/triggers;region=global/connect?project=GCP_PROJECT_ID to connect a repository to your project
```

## Using 2nd Generation

https://cloud.google.com/build/docs/automating-builds/github/connect-repo-github?generation=2nd-gen

### Connecting the repository programmatically using Terraform

Github

Required GitHub personal access token permissions:

repo: Grants full control of private repositories. This includes read, write, and administrative access to the repository.
public_repo: Grants read/write access to public repositories.
Installation Permissions:

If you're interacting with GitHub installations (such as GitHub Apps), you might need additional permissions:

read:org: Allows read access to the organization's data, including repositories, teams, and membership.
read:user: Allows read access to the user's profile and email addresses.
write:repo_hook: Grants the ability to manage hooks (webhooks) on repositories.
admin:repo_hook: Grants full control over hooks (webhooks) on repositories.
Specific Scopes for Actions:

Depending on the actions you intend to perform, you might need additional scopes:

write:discussion: Grants the ability to write discussions on repositories.
workflow: Grants the ability to manage workflows.

### Creating the build trigger

### Errors

- Error: Error creating Trigger: googleapi: Error 400: triggers with repository resources cannot be created in the "global" region
  - Change to use europe-west3
- generic::failed_precondition: due to quota restrictions, cannot run builds in this region
  - Change to use us-west1
- Error creating Trigger: googleapi: Error 400: location of the repository: \*\*\* does not match the current region: us-west1
  - Move back to europe-west3
  - Try to increase quota restrictions for europe-west3 in google console
    - Contact our Sales Team for requests above 0.

## References

- https://cloud.google.com/build/docs/automating-builds/github/connect-repo-github?generation=1st-gen
- https://cloud.google.com/build/docs/automating-builds/github/connect-repo-github?generation=2nd-gen
