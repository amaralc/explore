import { schemaValidator } from '@peerlab/kernel/shared-ts-utils/validators/json-schema-validator';
import userV1JsonSchema from './entity.schema';
import { IUserV1Dto } from './entity.schema.types';

export class UserV1Entity {
  id: string;
  email: string;
  emailVerified: boolean;
  displayName: string;
  photoURL: string | null;
  disabled: boolean;
  createdAt: string;
  updatedAt: string;

  constructor(inputDto: IUserV1Dto) {
    // Validate
    schemaValidator.validateOrReject(userV1JsonSchema, inputDto);
    this.email = inputDto.email;
    this.id = inputDto.id;
    this.emailVerified = inputDto.emailVerified;
    this.displayName = inputDto.displayName;
    this.photoURL = inputDto.photoURL;
    this.disabled = inputDto.disabled;
    this.createdAt = inputDto.createdAt;
    this.updatedAt = inputDto.updatedAt;
  }

  getDto(): IUserV1Dto {
    return {
      id: this.id,
      email: this.email,
      emailVerified: this.emailVerified,
      displayName: this.displayName,
      photoURL: this.photoURL,
      disabled: this.disabled,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
