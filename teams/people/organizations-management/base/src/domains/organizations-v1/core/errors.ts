export class OwnerAgentNotFoundError extends Error {
  constructor(message = 'Owner agent not found') {
    super(message);
  }
}
