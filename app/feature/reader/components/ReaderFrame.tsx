"use client";

import { RefObject, useCallback, useEffect } from "react";
import { THEMES } from "./readerSetting";

interface ReaderFrameProps {
  iframeRef: RefObject<HTMLIFrameElement | null>;
  content: string;
  onLoad: () => void;
  isReady: boolean;
  themeId: string;
  bgStyle: string;
}

export default function ReaderFrame({
  iframeRef,
  content,
  onLoad,
  isReady,
  themeId,
  bgStyle,
}: ReaderFrameProps) {
  const applyTheme = useCallback(() => {
    const theme = THEMES.find((t) => t.id === themeId);
    if (!theme || !iframeRef.current?.contentWindow) return;

    const win = iframeRef.current.contentWindow;
    const computedStyle = getComputedStyle(document.documentElement);
    const bg = computedStyle.getPropertyValue(theme.bgVar).trim();
    const fg = computedStyle.getPropertyValue(theme.fgVar).trim();

    if (bg) {
      win.document.body.style.backgroundColor = bg;
      win.document.documentElement.style.backgroundColor = bg;
    }
    if (fg) win.document.body.style.color = fg;
  }, [iframeRef, themeId]);

  useEffect(() => {
    if (!isReady) return;
    applyTheme();
  }, [applyTheme, isReady]);

  useEffect(() => {
    const checkTimer = setTimeout(() => {
      if (!isReady && iframeRef.current) {
        const doc = iframeRef.current.contentDocument;
        if (doc && doc.readyState === "complete") {
          onLoad();
        }
      }
    }, 1000);
    return () => clearTimeout(checkTimer);
  }, [isReady, onLoad, iframeRef]);

  return (
    <div className="flex-1 relative w-full h-full overflow-hidden">
      <div
        className="absolute inset-0 -z-10 transition-colors duration-300"
        style={{ backgroundColor: bgStyle }}
      />

      <iframe
        ref={iframeRef}
        srcDoc={content}
        onLoad={() => {
          onLoad();
          applyTheme();
        }}
        className="w-full h-full border-none block transition-opacity duration-200"
        sandbox="allow-scripts allow-same-origin"
        title="Reader"
        style={{ opacity: isReady ? 1 : 0 }}
      />
    </div>
  );
}
