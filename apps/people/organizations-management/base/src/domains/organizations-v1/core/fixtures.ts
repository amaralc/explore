import { randomBytes } from 'crypto';
import { fakeAgentsByIdOrEmail } from '../../agents-v1/core/fixtures';
import { OrganizationV1Entity } from './entity';

const fakeIndividualAgent01 = fakeAgentsByIdOrEmail.get('fake-agent-owner-of-free-organization@email.com');

const fakeOrganizationAgentRoot01 = fakeAgentsByIdOrEmail.get('fake-organization-agent-root-01@email.com');
const fakeOrganizationAgentRoot01Id = randomBytes(12).toString('hex');
const fakeOrganization01 = new OrganizationV1Entity({
  agentId: fakeOrganizationAgentRoot01.id,
  email: fakeOrganizationAgentRoot01.email,
  nickname: fakeOrganizationAgentRoot01.nickname,
  id: fakeOrganizationAgentRoot01Id,
  idPath: `/${fakeOrganizationAgentRoot01Id}`,
  ownerAgentId: fakeIndividualAgent01.id,
  planSubscriptionName: 'FREE',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const fakeOrganizationAgentChild01 = fakeAgentsByIdOrEmail.get('fake-organization-agent-child-01@email.com');
const fakeOrganizationAgentChild01Id = randomBytes(12).toString('hex');
const fakeOrganization02 = new OrganizationV1Entity({
  agentId: fakeOrganizationAgentChild01.id,
  email: fakeOrganizationAgentChild01.email,
  nickname: fakeOrganizationAgentChild01.nickname,
  id: fakeOrganizationAgentChild01Id,
  idPath: `/${fakeOrganizationAgentRoot01Id}/${fakeOrganizationAgentChild01Id}`,
  ownerAgentId: fakeOrganization01.agentId,
  planSubscriptionName: 'FREE',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const fakeOrganizationAgentChild02 = fakeAgentsByIdOrEmail.get('fake-organization-agent-child-02@email.com');
const fakeOrganizationAgentChild02Id = randomBytes(12).toString('hex');
const fakeOrganization03 = new OrganizationV1Entity({
  agentId: fakeOrganizationAgentChild02.id,
  email: fakeOrganizationAgentChild02.email,
  nickname: fakeOrganizationAgentChild02.nickname,
  id: fakeOrganizationAgentChild02Id,
  idPath: `/${fakeOrganizationAgentRoot01Id}/${fakeOrganizationAgentChild02Id}`,
  ownerAgentId: fakeOrganization01.agentId,
  planSubscriptionName: 'FREE',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const fakeOrganizations = [fakeOrganization01, fakeOrganization02, fakeOrganization03];

const organizationV1ByIdOrEmail: Map<string, OrganizationV1Entity> = new Map();
fakeOrganizations.forEach((agent) => {
  if (organizationV1ByIdOrEmail.has(agent.id) || organizationV1ByIdOrEmail.has(agent.email)) {
    throw new Error(`Agent with id ${agent.id} or email ${agent.email} already exists`);
  }
  organizationV1ByIdOrEmail.set(agent.id, agent);
  organizationV1ByIdOrEmail.set(agent.email, agent);
});

export const fakeOrganizationsByIdOrEmail = organizationV1ByIdOrEmail;
