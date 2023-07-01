import { OperationObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

const description = `
---
\`Experimental\`
---

# Create a new Peer

This endpoint help you to create a new Peer.

## Peer Definition

A Peer is a node that is connected to the network. It can be a researcher or a participant.

`;

export const postMethodDocs: Partial<OperationObject> = {
  summary: 'Create a new Peer',
  description,
  externalDocs: {
    url: 'https://en.wikipedia.org/wiki/Peer',
    description: 'Wikipedia definition of a Peer',
  },
};
