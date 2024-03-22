# Known Issues

- [x] Error while trying to create a new AgentV1 because Firebase UserRecord uid cannot be used as input in MongoDb new ObjectId() constructor. (https://console.cloud.google.com/functions/details/europe-west1/createAgentV1WhenUserV1IsCreated?env=gen1&project=production-294af8cd4959&tab=logs)
- [ ] Error: Error while updating cloudfunction configuration: Error waiting for Updating CloudFunctions Function: Error code 3, message: Build failed: This project is using pnpm but you have not included the Functions Framework in your dependencies. Please add it by running: 'pnpm add @google-cloud/functions-framework'.; Error ID: 5b6dc8b5

# References

- https://cloud.google.com/functions/docs/calling/firebase-auth
- https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/cloudfunctions_function#nested_event_trigger
- https://cloud.google.com/functions/docs/calling/firebase-auth#functions_firebase_auth-nodejs
- https://medium.com/p/5d75fcf21566
- https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/39aed246ed3e4970684f0612fe4e9b6e703186cd/functions/firebase/helloAuth/package.json
