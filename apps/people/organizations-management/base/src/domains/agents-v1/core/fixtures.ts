import { randomBytes } from 'crypto';
import { AgentV1Entity } from './entity';

export const fakeAgents = [
  new AgentV1Entity({
    email: 'fake-agent@email.com',
    id: randomBytes(14).toString('hex'),
    type: 'INDIVIDUAL',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }),
];

const agentByIdOrEmail: Map<string, AgentV1Entity> = new Map();
fakeAgents.forEach((agent) => {
  if (agentByIdOrEmail.has(agent.id) || agentByIdOrEmail.has(agent.email)) {
    throw new Error(`Agent with id ${agent.id} or email ${agent.email} already exists`);
  }
  agentByIdOrEmail.set(agent.id, agent);
  agentByIdOrEmail.set(agent.email, agent);
});

export const fakeAgentsByIdOrEmail = agentByIdOrEmail;
