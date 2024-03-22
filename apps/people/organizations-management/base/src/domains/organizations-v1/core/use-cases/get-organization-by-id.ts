import { OrganizationV1Entity } from '../entity';
import { OrganizationsV1Repository } from '../repository';

export class GetOrganizationV1ByIdUseCase {
  private organizationsV1Repository: OrganizationsV1Repository;

  constructor(organizationsV1Repository: OrganizationsV1Repository) {
    this.organizationsV1Repository = organizationsV1Repository;
  }

  public async execute(id: string): Promise<OrganizationV1Entity> {
    const organization = await this.organizationsV1Repository.findById(id);
    return organization;
  }
}
