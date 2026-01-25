"use client";

import { useMemo } from "react";
import { FONTS } from "../components/readerSetting";

interface UseReaderHtmlProps {
  initialHtml: string;
  fontSize: number;
  fontId: string;
  themeId: string;
  readMode: "paged" | "scroll";
}

export function useReaderHtml({
  initialHtml,
  fontSize,
  fontId,
  readMode,
}: UseReaderHtmlProps) {
  const currentFontFamily =
    FONTS.find((f) => f.id === fontId)?.value || "sans-serif";

  const processedHtml = useMemo(() => {
    let fixedHtml = (initialHtml || "").replace(/\.\.\/fonts\//g, "/fonts/");
    const isPaged = readMode === "paged";
    const spacerHtml = '<div id="force-new-page-spacer"></div>';

    if (isPaged) {
      if (fixedHtml.includes("</body>")) {
        fixedHtml = fixedHtml.replace("</body>", `${spacerHtml}</body>`);
      } else {
        fixedHtml += spacerHtml;
      }
    }

    const layoutStyles = isPaged
      ? `
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

          padding:  calc(var(--reader-paddingTOP) ) calc(var(--reader-paddingX) / 2) calc(var(--reader-paddingBOT) ) calc(var(--reader-paddingX) / 2) !important;

          column-width: calc(100vw - var(--reader-paddingX) - 1px) !important;
          column-gap: var(--reader-paddingX) !important;
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
      `
      : `
        html {
          height: 100%;
          width: 100%;
          overflow-y: auto !important;
          overflow-x: hidden !important;
        }
        body {
          margin: 0 !important;
          min-height: 100% !important;
          width: 100% !important;
          box-sizing: border-box !important;

          padding:  calc(var(--reader-paddingTOP) ) calc(var(--reader-paddingX) / 2) calc(var(--reader-paddingBOT) ) calc(var(--reader-paddingX) / 2) !important;

          column-width: auto !important;
          column-gap: 0 !important;
          column-fill: auto !important;

          font-size: ${fontSize}px !important;
          font-family: ${currentFontFamily} !important;
          line-height: 1.6 !important;
          text-align: justify !important;

          background-color: transparent;
          transition: background-color 0.3s, color 0.3s;
        }
      `;

    const injectionStyles = `
      <style>
        :root {
          --reader-paddingX: 20px; 
          --reader-paddingTOP: 10px; 
          --reader-paddingBOT: 15px; 

        }
        @media (min-width: 768px) {
          :root { --reader-paddingX: 400px; }
          :root { --reader-paddingTOP: 40px; }
          :root { --reader-paddingBOT: 60px; }
        }
        @media (min-width: 1280px) {
          :root { --reader-paddingX: 800px; }
          :root { --reader-paddingTOP: 80px; }
          :root { --reader-paddingBOT: 120px; }

        }
        ${layoutStyles}

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
  }, [initialHtml, fontSize, currentFontFamily, readMode]);

  return processedHtml;
}
