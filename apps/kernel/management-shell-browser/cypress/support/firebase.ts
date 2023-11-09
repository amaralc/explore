/**
 * Notes:
 *
 * Firebase uses indexedDb to store the user session. Since cypress-firebase does not support firebase 10, we need to
 * implement the login/logout ourselves, which means we needed to mock the indexedDb session.
 *
 * That was accomplished by using the IndexedDbFirebaseSessionRepository class, which is responsible for adding a mock
 * session to the indexedDb, removing all sessions from the indexedDb and getting a session from the indexedDb when needed.
 *
 * References:
 *
 * - https://docs.cypress.io/guides/end-to-end-testing/google-authentication
 * - https://developers.google.com/oauthplayground/
 * - https://www.npmjs.com/package/cypress-firebase
 * - https://makerkit.dev/blog/tutorials/programmatic-authentication-firebase-cypress
 * - https://www.youtube.com/watch?v=JqEzA44Lsts&ab_channel=JoshuaMorony
 * - https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB
 * - https://firebase.google.com/support/release-notes/js
 */

type FirebaseSession = {
  fbase_key: string;
  value: {
    uid: string;
    email: string;
    emailVerified: boolean;
    displayName: string;
    isAnonymous: boolean;
    photoURL: string;
    providerData: {
      providerId: string;
      uid: string;
      displayName: string;
      email: string;
      phoneNumber: null;
      photoURL: string;
    }[];
    stsTokenManager: {
      refreshToken: string;
      accessToken: string;
      expirationTime: number;
    };
    createdAt: string;
    lastLoginAt: string;
    apiKey: string;
    appName: string;
  };
};

abstract class FirebaseSessionRepository {
  abstract addMockSession(): Promise<void>;
  abstract getSession(fbase_key: string): Promise<FirebaseSession>;
  abstract removeAllSessions(): Promise<void>;
}

const fakeFirebaseUid = 'fake-firebase-uid';
const fakeGoogleId = 'fake-google-uid';
const fakeEmail = 'fake-email@fake-domain.com';
const fakeFullName = 'Fake Name';
const fakeRefreshToken = Cypress.env('googleRefreshToken');
const fakeAccessToken = Cypress.env('googleAccessToken');

export class IndexedDbFirebaseSessionRepository implements FirebaseSessionRepository {
  dbName = 'firebaseLocalStorageDb';
  dbVersion = 1;
  storeName = 'firebaseLocalStorage';
  keyPath = 'fbase_key';
  db?: IDBDatabase;
  objectStore?: IDBObjectStore;
  mockSession: FirebaseSession = {
    fbase_key: 'firebase:authUser:AIzaSyA-r-4omO75pg5DCorcAtYn74D-pcUJs9I:[DEFAULT]',
    value: {
      // uid: 'JD0ioP6yebSpYrTCN3UJU91rgzf1',
      uid: fakeFirebaseUid,
      email: fakeEmail,
      emailVerified: true,
      displayName: fakeFullName,
      isAnonymous: false,
      photoURL: 'https://lh3.googleusercontent.com/a/ACg8ocJ22raEJ9c3t1tfH0kqAKLqryBD6lAuHG7B-prM3ZPm=s96-c',
      providerData: [
        {
          providerId: 'google.com',
          uid: fakeGoogleId,
          displayName: fakeFullName,
          email: fakeEmail,
          phoneNumber: null,
          photoURL: 'https://lh3.googleusercontent.com/a/ACg8ocJ22raEJ9c3t1tfH0kqAKLqryBD6lAuHG7B-prM3ZPm=s96-c',
        },
      ],
      stsTokenManager: {
        refreshToken: fakeRefreshToken,
        accessToken: fakeAccessToken,
        expirationTime: 1694383616749,
      },
      createdAt: '1694273004017',
      lastLoginAt: '1694334982122',
      apiKey: Cypress.env('firebaseApiKey'),
      appName: '[DEFAULT]',
    },
  };

  async addMockSession(): Promise<void> {
    const request = window.indexedDB.open(this.dbName, this.dbVersion);
    request.onsuccess = (event) => {
      this.db = (event.target as IDBOpenDBRequest).result;
      this.objectStore = this.db.transaction([this.storeName], 'readwrite').objectStore(this.storeName);
      this.objectStore.put(this.mockSession);
    };
  }

  async getSession(fbase_key: string): Promise<FirebaseSession> {
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(this.dbName, this.dbVersion);
      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        this.objectStore = this.db.transaction([this.storeName], 'readonly').objectStore(this.storeName);
        const getRequest = this.objectStore.get(fbase_key);
        getRequest.onsuccess = (event) => {
          resolve((event.target as IDBRequest).result);
        };
        getRequest.onerror = (event) => {
          reject((event.target as IDBRequest).error);
        };
      };
    });
  }

  async removeAllSessions(): Promise<void> {
    const request = window.indexedDB.open(this.dbName, this.dbVersion);
    request.onsuccess = (event) => {
      this.db = (event.target as IDBOpenDBRequest).result;
      this.objectStore = this.db.transaction([this.storeName], 'readwrite').objectStore(this.storeName);
      this.objectStore.clear();
    };
  }
}

export const indexedDbFirebaseSessionRepository = new IndexedDbFirebaseSessionRepository();
