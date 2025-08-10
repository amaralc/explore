import { createAgentV1WhenUserV1IsCreated } from './create-agent-v1-when-user-v1-is-created';
import { deleteAgentV1WhenUserV1IsDeleted } from './delete-agent-v1-when-user-v1-is-deleted';

// In Cloud Functions (2nd gen), for all runtimes, use CloudEvent functions (https://cloud.google.com/functions/docs/writing/write-event-driven-functions)

// cloudEvent<UserRecord>('createAgentV1WhenUserV1IsCreated', (event) => {
//   console.log('createAgentV1WhenUserV1IsCreated', event.data?.uid);
//   // return createAgentV1WhenUserV1IsCreated(event);
// });

// cloudEvent<UserRecord>('publishNewUsersV1', (event) => {
//   console.log('publishNewUsersV1', event.data?.uid);
//   // return publishNewUsersV1(event);
// });

// In Cloud Functions (1st gen)
// For Node.js, Python, Go, and Java runtimes, use Background functions. (https://cloud.google.com/functions/docs/writing/write-event-driven-functions)

console.log('people-organizations-management-functions/main.ts');
exports.createAgentV1WhenUserV1IsCreated = createAgentV1WhenUserV1IsCreated;
exports.deleteAgentV1WhenUserV1IsDeleted = deleteAgentV1WhenUserV1IsDeleted;
