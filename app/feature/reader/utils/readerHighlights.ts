import type { NoteColor } from "@/app/types/book.types";

export const NOTE_HIGHLIGHT_COLORS: Record<NoteColor, string> = {
  yellow: "rgba(253, 224, 71, 0.6)",
  green: "rgba(134, 239, 172, 0.6)",
  blue: "rgba(147, 197, 253, 0.6)",
  pink: "rgba(249, 168, 212, 0.6)",
  purple: "rgba(196, 181, 253, 0.6)",
};

export interface NoteHighlightItem {
  selectedText?: string | null;
  color?: NoteColor | null;
}

export function applyNoteHighlights(
  doc: Document,
  notes: NoteHighlightItem[]
) {
  const body = doc.body;
  if (!body) return;

  const existing = doc.querySelectorAll("mark[data-note-highlight]");
  existing.forEach((node) => {
    const parent = node.parentNode;
    if (!parent) return;
    const fragment = doc.createDocumentFragment();
    while (node.firstChild) {
      fragment.appendChild(node.firstChild);
    }
    parent.replaceChild(fragment, node);
    parent.normalize();
  });

  const highlightNote = (note: NoteHighlightItem) => {
    const text = note.selectedText?.trim();
    if (!text) return;

    const textNodes: { node: Text; start: number; end: number }[] = [];
    let fullText = "";
    const walker = doc.createTreeWalker(body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue || !node.nodeValue.trim()) {
          return NodeFilter.FILTER_REJECT;
        }
        const parent = (node as Text).parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        if (parent.closest("mark[data-note-highlight]")) {
          return NodeFilter.FILTER_REJECT;
        }
        const tag = parent.tagName;
        if (tag === "SCRIPT" || tag === "STYLE") {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    while (walker.nextNode()) {
      const node = walker.currentNode as Text;
      const start = fullText.length;
      fullText += node.nodeValue ?? "";
      textNodes.push({ node, start, end: fullText.length });
    }

    const matchIndex = fullText.indexOf(text);
    if (matchIndex === -1) return;
    const matchEnd = matchIndex + text.length;

    const startNode = textNodes.find((entry) => entry.end > matchIndex);
    const endNode = textNodes.find((entry) => entry.end >= matchEnd);
    if (!startNode || !endNode) return;

    const range = doc.createRange();
    range.setStart(startNode.node, matchIndex - startNode.start);
    range.setEnd(endNode.node, matchEnd - endNode.start);

    const mark = doc.createElement("mark");
    mark.setAttribute("data-note-highlight", "true");
    const color = note.color ?? "yellow";
    mark.setAttribute("data-color", color);
    mark.style.cssText = [
      `background-color: ${NOTE_HIGHLIGHT_COLORS[color]} !important`,
      "color: inherit",
      "padding: 0 2px",
      "border-radius: 2px",
    ].join("; ");

    try {
      mark.appendChild(range.extractContents());
      range.insertNode(mark);
    } catch {
      // Ignore highlight errors for complex ranges.
    }
  };

  notes.forEach(highlightNote);
}

export function highlightSelection(
  doc: Document,
  color: NoteColor
) {
  const selection = doc.getSelection();
  if (!selection || selection.rangeCount === 0) return;
  const range = selection.getRangeAt(0);
  if (range.collapsed) return;

  const textNodes: Text[] = [];
  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue || !node.nodeValue.trim()) {
        return NodeFilter.FILTER_REJECT;
      }
      const parent = (node as Text).parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (parent.closest("mark[data-note-highlight]")) {
        return NodeFilter.FILTER_REJECT;
      }
      const tag = parent.tagName;
      if (tag === "SCRIPT" || tag === "STYLE") {
        return NodeFilter.FILTER_REJECT;
      }
      return range.intersectsNode(node)
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT;
    },
  });

  try {
    while (walker.nextNode()) {
      textNodes.push(walker.currentNode as Text);
    }

    textNodes.forEach((node) => {
      let startOffset = 0;
      let endOffset = node.nodeValue?.length ?? 0;

      if (node === range.startContainer) {
        startOffset = range.startOffset;
      }
      if (node === range.endContainer) {
        endOffset = range.endOffset;
      }

      if (startOffset >= endOffset) return;

      const endSplit = node.splitText(endOffset);
      const midSplit = node.splitText(startOffset);

      const mark = doc.createElement("mark");
      mark.setAttribute("data-note-highlight", "true");
      mark.setAttribute("data-color", color);
      mark.style.cssText = [
        `background-color: ${NOTE_HIGHLIGHT_COLORS[color]} !important`,
        "color: inherit",
        "padding: 0 2px",
        "border-radius: 2px",
      ].join("; ");
      mark.textContent = midSplit.nodeValue ?? "";
      midSplit.parentNode?.replaceChild(mark, midSplit);
      if (endSplit) {
        endSplit.parentNode?.normalize();
      }
    });
    selection.removeAllRanges();
  } catch {
    // Fall back to text matching on next render.
  }
}
