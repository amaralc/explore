import { Static, Type } from '@sinclair/typebox';
import { schemaValidator } from '../../../utils/validators/json-schema-validator';

export const userV1JsonSchema = Type.Object({
  id: Type.String({
    minLength: 28,
    maxLength: 28,
    pattern: '^[A-Za-z0-9]{28}$',
    description: 'The unique identifier for a user, expected to be 28 characters long.',
  }),
  email: Type.String({
    format: 'email',
    description: 'The email address of the user.',
  }),
  emailVerified: Type.Boolean({
    description: "Flag indicating whether the user's email address has been verified.",
  }),
  displayName: Type.String({
    description: 'The display name of the user.',
  }),
  photoURL: Type.Optional(
    Type.String({
      format: 'uri',
      description: "The URL of the user's photo.",
    }),
  ),
  disabled: Type.Boolean({
    description: 'Flag indicating whether the user account is disabled.',
  }),
  createdAt: Type.String({
    format: 'date-time',
    description: 'The creation date and time of the user account.',
    pattern: '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3}Z$',
  }),
  updatedAt: Type.String({
    format: 'date-time',
    description: 'The last update date and time of the user account.',
    pattern: '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3}Z$',
  }),
});

export type IUserV1Dto = Static<typeof userV1JsonSchema>;

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
