export const isJsonString = (value: unknown) => {
  try {
    JSON.parse(String(value));
  } catch (e) {
    return false;
  }
  return true;
};
