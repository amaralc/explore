export const iso8601DateFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
export const firebaseIdFormat = /^[A-Za-z0-9]{24,28}$/;
export const mongoDbIdFormat = /^[0-9a-fA-F]{24}$/;
export const lineageIdPathFormat = /^[/][0-9a-fA-F]{24}(?:\/[0-9a-fA-F]{24})*$/;

export const idPathEndingWithId = (id: string) => {
  return new RegExp(`^/[0-9a-fA-F]{24}(?:/[0-9a-fA-F]{24})*/${id}$`);
};
