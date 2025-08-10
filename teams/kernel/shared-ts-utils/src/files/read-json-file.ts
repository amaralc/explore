import { readFileSync } from 'node:fs';

export const readJsonFile = (filePath: string) => {
  // Read the file synchronously
  const data = readFileSync(filePath, 'utf8');

  // Parse the JSON data
  const jsonArray = JSON.parse(data);
  return jsonArray;
};
