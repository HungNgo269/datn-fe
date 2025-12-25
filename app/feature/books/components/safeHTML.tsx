import DOMPurify from "isomorphic-dompurify";
import { JSDOM } from "jsdom";

interface SafeHTMLProps {
  htmlContent: string;
  className?: string;
}
export function SafeHTML({ htmlContent, className }: SafeHTMLProps) {
  return (
    <div
      className={`prose prose-sm dark:prose-invert max-w-none ${className}`}
      dangerouslySetInnerHTML={{
        __html: DOMPurify(new JSDOM(htmlContent).window).sanitize(
          "<img src=x onerror=alert(1)//>"
        ),
      }}
    />
  );
}
