import { createHash } from 'crypto';

export const hashIntegerIntoValidObjectId = (integer: number) => {
  // Validate integer
  if (!Number.isInteger(integer)) {
    throw new Error('Input is not an integer');
  }

  if (integer > 4294967295) {
    throw new Error('Input is out of range. It must be >= 0 and <= 4294967295.');
  }

  // Create a hash from the integer for uniqueness
  const hash = createHash('sha256');
  hash.update(Buffer.from(integer.toString()));
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
  return Buffer.concat([timestampBuffer, machineId, processId, counter]).toString('hex');
};
