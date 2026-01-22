import React from 'react';
import katex from 'katex';

interface MathTextProps {
  text: string;
  className?: string;
}

export const MathText: React.FC<MathTextProps> = ({ text, className = '' }) => {
  if (!text) return null;

  // Regex giải thích:
  // 1. \$\$[\s\S]*?\$\$  -> Bắt Display Math $$...$$
  // 2. \\\[[\s\S]*?\\\]  -> Bắt Display Math \[...\]
  // 3. \\\(.*?\\\)       -> Bắt Inline Math \(...\)
  // 4. (?<!\\)\$.*?(?<!\\)\$ -> Bắt Inline Math $...$ (nhưng không bắt \$ đã escape)
  const regex = /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\\\(.*?\\\)|(?<!\\)\$(?:[^$]+)(?<!\\)\$)/g;

  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        // Display Mode $$...$$
        if (part.startsWith('$$') && part.endsWith('$$')) {
           const math = part.slice(2, -2);
           try {
             const html = katex.renderToString(math, { displayMode: true, throwOnError: false, output: 'html' });
             return <span key={index} dangerouslySetInnerHTML={{ __html: html }} />;
           } catch { return <span key={index}>{part}</span>; }
        } 
        // Display Mode \[...\]
        else if (part.startsWith('\\[') && part.endsWith('\\]')) {
           const math = part.slice(2, -2);
           try {
             const html = katex.renderToString(math, { displayMode: true, throwOnError: false, output: 'html' });
             return <span key={index} dangerouslySetInnerHTML={{ __html: html }} />;
           } catch { return <span key={index}>{part}</span>; }
        } 
        // Inline Mode \(...\)
        else if (part.startsWith('\\(') && part.endsWith('\\)')) {
           const math = part.slice(2, -2);
           try {
             const html = katex.renderToString(math, { displayMode: false, throwOnError: false, output: 'html' });
             return <span key={index} dangerouslySetInnerHTML={{ __html: html }} />;
           } catch { return <span key={index}>{part}</span>; }
        }
        // Inline Mode $...$
        else if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
           const math = part.slice(1, -1);
           try {
             const html = katex.renderToString(math, { displayMode: false, throwOnError: false, output: 'html' });
             return <span key={index} dangerouslySetInnerHTML={{ __html: html }} />;
           } catch { return <span key={index}>{part}</span>; }
        } 
        // Regular Text
        else {
           // Xử lý xuống dòng trong văn bản thường
           return <span key={index}>{part}</span>;
        }
      })}
    </span>
  );
};