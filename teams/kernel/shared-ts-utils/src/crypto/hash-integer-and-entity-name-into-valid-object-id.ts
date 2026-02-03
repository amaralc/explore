import { createHash } from 'crypto';
import { IMultiEntityName } from './types';

export const hashIntegerAndEntityNameIntoValidObjectId = (integer: number, entityName: IMultiEntityName) => {
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
  const bytes = hash.digest();

  // Convert the integer to a buffer for the timestamp (use a static date as an example)
  const timestamp = Math.floor(new Date(integer).getTime() / 1000);
  const timestampBuffer = Buffer.alloc(4);
  timestampBuffer.writeUInt32BE(timestamp);

  // Use parts of the hash for machine and process IDs and the counter
  const machineId = bytes.subarray(0, 3);
  const processId = bytes.subarray(3, 5);
  const counter = bytes.subarray(5, 8);

  // Concatenate all parts to form the ObjectID
  const result = new Uint8Array(12);
  result.set(timestampBuffer, 0);
  result.set(machineId, 4);
  result.set(processId, 7);
  result.set(counter, 9);
  return Buffer.from(result).toString('hex');
};
