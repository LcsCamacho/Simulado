"use client";

import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import type { Components } from "react-markdown";
import { QuestionImage } from "./QuestionImage";

const components: Components = {
  img: ({ src, alt }) => {
    if (!src || typeof src !== "string") return null;
    return <QuestionImage src={src} alt={alt ?? ""} className="my-4" />;
  },
  p: ({ children }) => (
    <p className="mb-4 last:mb-0 text-body-lg leading-7 text-on-surface-variant">
      {children}
    </p>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-on-surface">{children}</strong>
  ),
};

interface QuestionContextProps {
  content: string;
}

export function QuestionContext({ content }: QuestionContextProps) {
  return (
    <div className="mb-6 max-w-none rounded-button bg-surface-container-low p-5">
      <ReactMarkdown remarkPlugins={[remarkBreaks]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
