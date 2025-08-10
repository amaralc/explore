export class DuplicatedOrganizationNicknamesError extends Error {
  constructor() {
    super('Organization with same nickname already exists');
  }
}

export class DuplicatedIndividualAgentEmailError extends Error {
  constructor() {
    super('Another individual agent with same email already exists. Please use another email.');
  }
}

export class FreeOrganizationLimitReachedError extends Error {
  constructor() {
    super('Owner agent already have a free organization');
  }
}
