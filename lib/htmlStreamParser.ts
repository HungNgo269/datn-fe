export interface HtmlStreamOptions {
  minChunkSize?: number;
  maxChunkSize?: number;
}

export interface HtmlExtractionResult {
  body: string;
  styles: string;
}

export interface HtmlStreamResult {
  styles: string;
  chunks: string[];
  totalBytes: number;
}

const DEFAULT_MIN_CHUNK_SIZE = 30 * 1024;
const DEFAULT_MAX_CHUNK_SIZE = 50 * 1024;

const STYLE_TAG_PATTERN = /<style\b[^>]*>[\s\S]*?<\/style>/gi;
const LINK_STYLE_PATTERN =
  /<link\b[^>]*rel=["'][^"']*stylesheet[^"']*["'][^>]*>/gi;
const BODY_PATTERN = /<body\b[^>]*>([\s\S]*?)<\/body>/i;

const CHUNK_BREAK_PATTERN =
  /<\/(p|section|article|div|h[1-6]|li|blockquote|pre|figure|table|tr|td|th|ul|ol|header|footer|main)>/gi;

const encoder = new TextEncoder();

const getByteSize = (value: string) => encoder.encode(value).length;

export function extractHtmlForStreaming(html: string): HtmlExtractionResult {
  const styles: string[] = [];
  let cleaned = html;

  const stylePattern = new RegExp(STYLE_TAG_PATTERN.source, "gi");
  const linkPattern = new RegExp(LINK_STYLE_PATTERN.source, "gi");

  cleaned = cleaned.replace(stylePattern, (match) => {
    styles.push(match);
    return "";
  });

  cleaned = cleaned.replace(linkPattern, (match) => {
    styles.push(match);
    return "";
  });

  const bodyMatch = cleaned.match(BODY_PATTERN);
  const body = bodyMatch ? bodyMatch[1] : cleaned;

  return {
    body,
    styles: styles.join("\n"),
  };
}

export function chunkHtmlBody(
  body: string,
  options: HtmlStreamOptions = {}
): string[] {
  const minChunkSize = options.minChunkSize ?? DEFAULT_MIN_CHUNK_SIZE;
  const maxChunkSize = options.maxChunkSize ?? DEFAULT_MAX_CHUNK_SIZE;
  const chunks: string[] = [];

  let lastIndex = 0;
  let lastMatchEnd = 0;
  let currentSize = 0;

  const breakPattern = new RegExp(CHUNK_BREAK_PATTERN.source, "gi");
  let match: RegExpExecArray | null;
  while ((match = breakPattern.exec(body)) !== null) {
    const endIndex = match.index + match[0].length;
    const slice = body.slice(lastMatchEnd, endIndex);
    currentSize += getByteSize(slice);
    lastMatchEnd = endIndex;

    if (currentSize >= maxChunkSize) {
      const chunk = body.slice(lastIndex, endIndex);
      if (chunk.trim()) {
        chunks.push(chunk);
      }
      lastIndex = endIndex;
      currentSize = 0;
    }
  }

  const remaining = body.slice(lastIndex);
  if (remaining.trim()) {
    const remainingSize = getByteSize(remaining);
    if (chunks.length > 0 && remainingSize < minChunkSize) {
      chunks[chunks.length - 1] += remaining;
    } else {
      chunks.push(remaining);
    }
  }

  if (chunks.length === 0 && body.trim()) {
    chunks.push(body);
  }

  return chunks;
}

export function parseHtmlForStreaming(
  html: string,
  options: HtmlStreamOptions = {}
): HtmlStreamResult {
  const { body, styles } = extractHtmlForStreaming(html);
  const chunks = chunkHtmlBody(body, options);

  return {
    styles,
    chunks,
    totalBytes: getByteSize(body),
  };
}
