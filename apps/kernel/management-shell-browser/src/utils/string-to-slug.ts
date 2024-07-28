export const stringToSlug = (str: string | undefined): string => {
  if (!str) {
    return '';
  }

  // Normalize the string to decompose combined graphemes
  const normalized = str.normalize('NFD');

  // Replace characters which are not non-spacing marks
  const withoutDiacritics = normalized.replace(/[\p{M}]/gu, '');

  // Convert special characters to "-", then remove consecutive "-" and trim
  const withHyphens = withoutDiacritics
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '-') // Convert special characters to "-"
    .replace(/[\s_]+/g, '-') // Convert spaces and underscores to "-"
    .replace(/-+/g, '-'); // Replace multiple consecutive "-" with a single "-"

  return withHyphens;
};
