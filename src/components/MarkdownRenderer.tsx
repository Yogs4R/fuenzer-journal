import React from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
  isUser?: boolean;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, isUser = false }) => {
  return (
    <div className={`markdown-body text-xs sm:text-sm leading-relaxed ${isUser ? 'text-[#fbfaf5]' : 'text-[#2c2c26]'}`}>
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className={`font-serif italic font-bold text-base sm:text-lg mt-3 mb-1.5 ${isUser ? 'text-[#ffffff]' : 'text-[#2c2c26]'}`}>
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className={`font-serif italic font-bold text-sm sm:text-base mt-2.5 mb-1 ${isUser ? 'text-[#ffffff]' : 'text-[#2c2c26]'}`}>
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className={`font-serif italic font-bold text-xs sm:text-sm mt-2 mb-1 ${isUser ? 'text-[#ffffff]' : 'text-[#2c2c26]'}`}>
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-2 last:mb-0 leading-relaxed font-normal">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className={`font-bold ${isUser ? 'text-[#ffffff]' : 'text-[#2c2c26]'}`}>
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic">{children}</em>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-outside pl-4 space-y-1 mb-2">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-outside pl-4 space-y-1 mb-2">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed">{children}</li>
          ),
          blockquote: ({ children }) => (
            <blockquote className={`border-l-2 pl-3 py-0.5 my-2 italic ${isUser ? 'border-[#d8d8cc] text-[#ecece0]' : 'border-[#7d8461] bg-[#7d8461]/5 text-[#4c5432]'}`}>
              {children}
            </blockquote>
          ),
          code: ({ children, className }) => {
            const isBlock = className?.includes('language-');
            if (isBlock) {
              return (
                <div className="overflow-x-auto my-2 p-2 bg-[#2c2c26] text-[#fbfaf5] font-mono text-[11px] border border-[#3a3a30]">
                  <code>{children}</code>
                </div>
              );
            }
            return (
              <code className={`px-1.5 py-0.5 font-mono text-[11px] ${isUser ? 'bg-[#4f4f42] text-[#fbfaf5]' : 'bg-[#f4f4ea] text-[#4c5432] border border-[#ecece0]'}`}>
                {children}
              </code>
            );
          },
          table: ({ children }) => (
            <div className="overflow-x-auto my-2.5">
              <table className={`w-full text-left text-xs border-collapse border ${isUser ? 'border-[#4f4f42]' : 'border-[#ecece0]'}`}>
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className={isUser ? 'bg-[#3e3e34]' : 'bg-[#f4f4ea]'}>
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-[#ecece0]">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className={isUser ? 'border-b border-[#4f4f42]' : 'border-b border-[#ecece0]'}>
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className={`p-2 font-bold font-serif italic text-xs ${isUser ? 'text-[#ffffff]' : 'text-[#2c2c26]'}`}>
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="p-2 text-xs">
              {children}
            </td>
          ),
          hr: () => (
            <hr className={`my-3 ${isUser ? 'border-[#4f4f42]' : 'border-[#ecece0]'}`} />
          ),
        }}
      >
        {content}
      </Markdown>
    </div>
  );
};
