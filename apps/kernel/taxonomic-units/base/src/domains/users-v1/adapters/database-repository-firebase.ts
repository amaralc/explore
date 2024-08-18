import { UserRecord } from 'firebase-admin/auth';
import { UsersV1DatabaseRepository } from '../core/database-repository';
import { IUserV1Dto } from '../core/entity.schema.types';
import { UserV1AuthenticationEventDto } from '../core/events-repository';

export class FirebaseUsersV1DatabaseRepository implements UsersV1DatabaseRepository {
  static mapBackgroundFunctionAuthEventToDomain(eventData: UserV1AuthenticationEventDto): IUserV1Dto {
    return {
      id: eventData.uid,
      email: eventData.email,
      emailVerified: eventData.emailVerified,
      displayName: eventData.displayName,
      photoURL: eventData.photoURL,
      disabled: false,
      createdAt: new Date(eventData.metadata.createdAt).toISOString(),
      updatedAt: new Date(eventData.metadata.lastSignedInAt).toISOString(),
    };
  }

  static mapFirebaseToDomain(firebaseUser: UserRecord): IUserV1Dto {
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email,
      emailVerified: firebaseUser.emailVerified,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      disabled: firebaseUser.disabled,
      createdAt: new Date(firebaseUser.metadata.creationTime).toISOString(),
      updatedAt: new Date(firebaseUser.metadata.lastSignInTime).toISOString(),
    };
  }
}
