export const isJsonObject = (value: unknown) => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};
