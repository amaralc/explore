import { createHash } from 'crypto';
import { IMultiEntityName } from './types';

export const hashIntegerAndEntityNameIntoValidFirebaseUID = (integer: number, entityName: IMultiEntityName) => {
  // Validate integer
  if (!Number.isInteger(integer)) {
    throw new Error('Input is not an integer');
  }

  if (typeof entityName !== 'string') {
    throw new Error('Entity name must be a string');
  }

  if (integer > 4294967295) {
    throw new Error('Input is out of range. It must be >= 0 and <= 4294967295.');
  }

  // Create a hash from the integer for uniqueness
  const hash = createHash('sha256');
  hash.update(integer.toString() + entityName);
  const uid = hash.digest('hex'); // Get the hexadecimal string of the hash

  // Firebase UID can be up to 128 characters, but we'll use a standard length from the hash
  return uid.substring(0, 28); // Use the first 28 characters to ensure it's not excessively long
};
