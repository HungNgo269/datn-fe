import DOMPurify from "isomorphic-dompurify";
import { normalizeHtmlSpaces } from "./helper";

const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "em",
  "u",
  "i",
  "b",
  "blockquote",
  "ul",
  "ol",
  "li",
  "span",
  "a",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
];

const ALLOWED_ATTR = ["href", "target", "rel", "title"];

export function sanitizeRichHtml(value?: string | null) {
  const normalized = normalizeHtmlSpaces(value ?? "");
  if (!normalized) return "";
  return DOMPurify.sanitize(normalized, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
  });
}
