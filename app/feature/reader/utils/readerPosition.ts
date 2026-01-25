import type { ReaderReadMode } from "@/app/types/book.types";

type CaretDocument = Document & {
  caretRangeFromPoint?: (x: number, y: number) => Range | null;
  caretPositionFromPoint?: (
    x: number,
    y: number,
  ) => { offsetNode: Node | null } | null;
};

const ANCHOR_SELECTOR =
  "p,li,h1,h2,h3,h4,h5,h6,blockquote,pre,figure,figcaption,table,td,th";

const resolveAnchorElement = (element: Element | null): Element | null => {
  if (!element) return null;
  if (element.matches(ANCHOR_SELECTOR)) return element;
  return element.closest(ANCHOR_SELECTOR);
};
// Có id thì dùng id, còn không dùng body, nếu không nữa tìm parent  -> xét thứ tự con
export function getUniquePath(element: Element): string {
  if (element.id) {
    const safeId =
      typeof CSS !== "undefined" && CSS.escape
        ? CSS.escape(element.id)
        : element.id;
    return `#${safeId}`;
  }

  if (element.tagName === "BODY") {
    return "body";
  }

  const parent = element.parentElement;
  if (!parent) {
    return element.tagName.toLowerCase();
  }

  const siblings = Array.from(parent.children);
  const index = siblings.indexOf(element) + 1;
  const tagName = element.tagName.toLowerCase();

  return `${getUniquePath(parent)} > ${tagName}:nth-child(${index})`;
}

export function captureBookmarkAnchorPath(
  iframe: HTMLIFrameElement,
): string | null {
  const doc = iframe.contentDocument as CaretDocument | null;
  if (!doc) return null;

  const width = iframe.clientWidth;
  const height = iframe.clientHeight;
  const x = width > 0 ? Math.floor(width * 0.5) : 50;
  const y = height > 0 ? Math.floor(height * 0.1) : 50;

  let element: Element | null = null;

  if (doc.caretRangeFromPoint) {
    const range = doc.caretRangeFromPoint(x, y);
    if (range?.startContainer) {
      element = range.startContainer.parentElement;
    }
  }

  if (!element && doc.caretPositionFromPoint) {
    const position = doc.caretPositionFromPoint(x, y);
    if (position?.offsetNode) {
      element = position.offsetNode.parentElement;
    }
  }

  if (!element && doc.elementsFromPoint) {
    const elements = doc.elementsFromPoint(x, y);
    for (const candidate of elements) {
      const anchor = resolveAnchorElement(candidate);
      if (anchor) {
        element = anchor;
        break;
      }
    }
  }

  if (!element) {
    element = doc.elementFromPoint(x, y);
  }

  const anchor = resolveAnchorElement(element);
  if (!anchor) return null;

  return getUniquePath(anchor);
}

export function resolvePageFromSelector(
  iframe: HTMLIFrameElement,
  selectorPath: string,
  readMode: ReaderReadMode,
): number | null {
  const doc = iframe.contentDocument;
  const win = iframe.contentWindow;
  if (!doc || !win) return null;

  try {
    const targetEl = doc.querySelector(selectorPath);
    if (!targetEl) return null;

    const rect = targetEl.getBoundingClientRect();

    if (readMode === "scroll") {
      const viewHeight = iframe.clientHeight;
      if (viewHeight <= 0) return null;
      const offset = rect.top + win.scrollY;
      return Math.max(1, Math.floor(offset / viewHeight) + 1);
    }

    const viewWidth = iframe.clientWidth;
    if (viewWidth <= 0) return null;
    const offset = rect.left + win.scrollX;
    return Math.max(1, Math.floor(offset / viewWidth) + 1);
  } catch (error) {
    console.error("Failed to resolve bookmark position:", error);
    return null;
  }
}

export function captureSelectionAnchorPath(
  iframe: HTMLIFrameElement,
): string | null {
  const win = iframe.contentWindow;
  if (!win) return null;
  const selection = win.getSelection();
  if (!selection || selection.rangeCount === 0) return null;
  const range = selection.getRangeAt(0);
  if (range.collapsed) return null;

  const startNode = range.startContainer;
  const element =
    startNode.nodeType === Node.ELEMENT_NODE
      ? (startNode as Element)
      : startNode.parentElement;
  const anchor = resolveAnchorElement(element);
  if (!anchor) return null;

  return getUniquePath(anchor);
}
