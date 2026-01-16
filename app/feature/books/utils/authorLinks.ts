function slugifyAuthorName(name?: string | null): string | null {
  if (!name) return null;
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildAuthorHref(
  authorName?: string | null,
  slug?: string | null
): string {
  const normalizedSlug = slug || slugifyAuthorName(authorName);
  if (normalizedSlug) {
    return `/authors/${normalizedSlug}`;
  }
  return "/authors";
}
