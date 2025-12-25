"use client";

import { useMemo } from "react";
import { FONTS } from "../components/readerSetting";

interface UseReaderHtmlProps {
  initialHtml: string;
  fontSize: number;
  fontId: string;
  themeId: string;
}

export function useReaderHtml({
  initialHtml,
  fontSize,
  fontId,
}: UseReaderHtmlProps) {
  const currentFontFamily =
    FONTS.find((f) => f.id === fontId)?.value || "sans-serif";

  const processedHtml = useMemo(() => {
    let fixedHtml = initialHtml.replace(/\.\.\/fonts\//g, "/fonts/");
    const spacerHtml = '<div id="force-new-page-spacer"></div>';

    if (fixedHtml.includes("</body>")) {
      fixedHtml = fixedHtml.replace("</body>", `${spacerHtml}</body>`);
    } else {
      fixedHtml += spacerHtml;
    }

    const injectionStyles = `
      <style>
        :root {
          --reader-padding: 20px; 
        }
        @media (min-width: 768px) {
          :root { --reader-padding: 400px; }
        }
        @media (min-width: 1280px) {
          :root { --reader-padding: 800px; }
        }

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
          
          padding: 40px calc(var(--reader-padding) / 2) !important;
          
          column-width: calc(100vw - var(--reader-padding) - 1px) !important;
          column-gap: var(--reader-padding) !important;
          column-fill: auto !important;
          
          font-size: ${fontSize}px !important;
          font-family: ${currentFontFamily} !important;
          line-height: 1.6 !important;
          text-align: justify !important;
          
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
  }, [initialHtml, fontSize, currentFontFamily]);

  return processedHtml;
}
