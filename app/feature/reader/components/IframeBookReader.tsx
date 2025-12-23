"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Settings } from "lucide-react";
import ReaderSettings, { FONTS, THEMES } from "./readerSetting";

interface Props {
  initialHtml: string;
  title: string;
}

export default function IframeBookReader({ initialHtml, title }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const [showSettings, setShowSettings] = useState(false);
  const [fontSize, setFontSize] = useState(18);
  const [fontId, setFontId] = useState("sans");
  const [themeId, setThemeId] = useState("light");

  const PADDING_X_PX = 400;

  const currentFontFamily =
    FONTS.find((f: { id: string }) => f.id === fontId)?.value || "sans-serif";

  const processHtml = useCallback(
    (html: string) => {
      let fixedHtml = html.replace(/\.\.\/fonts\//g, "/fonts/");
      const spacerHtml = '<div id="force-new-page-spacer"></div>';

      if (fixedHtml.includes("</body>")) {
        fixedHtml = fixedHtml.replace("</body>", `${spacerHtml}</body>`);
      } else {
        fixedHtml += spacerHtml;
      }

      const injectionStyles = `
        <style>
          html {
            height: 100vh;
            width: 100%;
            overflow: hidden !important;
          }
          
          body {
            margin: 0 !important;
            height: 100vh !important;
            width: 100% !important;
            box-sizing: border-box !important;
            padding: 40px ${PADDING_X_PX / 2}px !important;
            
            /* Column Logic chuẩn của bạn */
            column-width: calc(100vw - ${PADDING_X_PX}px - 1px) !important;
            column-gap: ${PADDING_X_PX}px !important;
            column-fill: auto !important;
            
            /* Dynamic Styles */
            font-size: ${fontSize}px !important;
            font-family: ${currentFontFamily} !important;
            line-height: 1.6 !important;
            text-align: justify !important;
            
            /* Màu mặc định (sẽ bị JS override sau, nhưng cần để tránh FOUC) */
            background-color: transparent; 
            transition: background-color 0.3s, color 0.3s;
          }

          #force-new-page-spacer {
            break-before: column !important;
            -webkit-column-break-before: always !important;
            width: 0px; height: 1px; margin: 0; padding: 0; visibility: hidden;
          }

          img, figure, table {
            max-width: 100% !important;
            break-inside: avoid !important;
            display: block;
            margin: 0 auto !important;
          }
          
          ::-webkit-scrollbar { display: none; }
        </style>
      `;

      if (fixedHtml.includes("</head>")) {
        return fixedHtml.replace("</head>", `${injectionStyles}</head>`);
      }
      return injectionStyles + fixedHtml;
    },
    [fontSize, currentFontFamily]
  );

  const calculatePagination = () => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentWindow) return;

    const doc = iframe.contentWindow.document.documentElement;
    const clientWidth = iframe.clientWidth;

    if (clientWidth > 0) {
      const rawTotal = Math.ceil(doc.scrollWidth / clientWidth);
      setTotalPages(Math.max(1, rawTotal - 1));
    }
  };

  useEffect(() => {
    if (ready && iframeRef.current?.contentWindow) {
      const theme =
        THEMES.find((t: { id: string }) => t.id === themeId) || THEMES[0];
      const body = iframeRef.current.contentWindow.document.body;

      body.style.backgroundColor = theme.bgClass;
      body.style.color = theme.fgClass;
    }
  }, [themeId, ready]);

  const handleIframeLoad = () => {
    setReady(true);
    const theme =
      THEMES.find((t: { id: string }) => t.id === themeId) || THEMES[0];
    if (iframeRef.current?.contentWindow) {
      const body = iframeRef.current.contentWindow.document.body;
      body.style.backgroundColor = theme.bgClass;
      body.style.color = theme.fgClass;
    }
    setTimeout(calculatePagination, 300);
  };

  const goToPage = (page: number) => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentWindow) return;

    const viewportWidth = iframe.clientWidth;
    iframe.contentWindow.scrollTo({
      left: (page - 1) * viewportWidth,
      behavior: "instant",
    });
    setCurrentPage(page);
  };

  const next = () => {
    if (currentPage < totalPages) goToPage(currentPage + 1);
  };
  const prev = () => {
    if (currentPage > 1) goToPage(currentPage - 1);
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [currentPage, totalPages]);

  return (
    <div className="flex flex-col h-full w-full relative overflow-hidden bg-muted transition-colors duration-300">
      <div className="h-14 bg-card border-b border-border flex items-center justify-between px-4 shrink-0 shadow-sm z-20 relative">
        <button
          onClick={prev}
          disabled={currentPage === 1}
          className="p-2 hover:bg-muted rounded text-foreground disabled:opacity-30 transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="text-center">
          <h1 className="font-semibold text-foreground text-sm md:text-base line-clamp-1 max-w-[150px] md:max-w-md">
            {title}
          </h1>
          <p className="text-xs text-muted-foreground">
            Trang {currentPage} / {totalPages || "--"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded transition-colors ${
              showSettings ? "bg-muted" : "hover:bg-muted"
            } text-foreground`}
          >
            <Settings className="w-5 h-5" />
          </button>

          <button
            onClick={next}
            disabled={currentPage === totalPages}
            className="p-2 hover:bg-muted rounded text-foreground disabled:opacity-30 ml-2 transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        <ReaderSettings
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          fontSize={fontSize}
          setFontSize={setFontSize}
          currentTheme={themeId}
          setTheme={setThemeId}
          currentFont={fontId}
          setFont={setFontId}
        />
      </div>

      <div className="flex-1 relative w-full h-full overflow-hidden">
        <div
          className="absolute inset-0 -z-10"
          style={{
            backgroundColor: THEMES.find(
              (t: { id: string }) => t.id === themeId
            )?.bgClass,
          }}
        />

        <iframe
          ref={iframeRef}
          srcDoc={processHtml(initialHtml)}
          onLoad={handleIframeLoad}
          className="w-full h-full border-none block"
          sandbox="allow-scripts allow-same-origin"
          title="Reader"
        />

        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
            <div className="w-8 h-8 border-4 border-muted border-t-success rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </div>
  );
}
