import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

const parseInline = (text: string): React.ReactNode[] => {
  // Regex to split by markdown syntax: Code, Link, Bold, Italic
  // Note: Order matters to avoid nested conflict issues in simple parser
  const regex = /(`[^`]+`|\[[^\]]+\]\([^)]+\)|\*\*[^\*]+\*\*|\*[^\*]+\*)/g;
  
  return text.split(regex).map((part, index) => {
    if (!part) return null;

    // Inline Code
    if (part.startsWith('`') && part.endsWith('`')) {
       return <code key={index} className="bg-[#49454F]/50 text-[#E6E0E9] px-1.5 py-0.5 rounded text-[13px] font-mono border border-[#49454F]">{part.slice(1, -1)}</code>;
    }

    // Link
    if (part.startsWith('[') && part.endsWith(')')) {
       const match = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
       if (match) {
         return <a key={index} href={match[2]} target="_blank" rel="noopener noreferrer" className="text-[#D0BCFF] hover:text-[#E8DEF8] underline decoration-from-font underline-offset-2 break-all">{match[1]}</a>;
       }
    }
    
    // Bold
    if (part.startsWith('**') && part.endsWith('**')) {
       return <strong key={index} className="font-bold text-white">{part.slice(2, -2)}</strong>;
    }
    
    // Italic
    if (part.startsWith('*') && part.endsWith('*')) {
       return <em key={index} className="italic text-[#E6E0E9]/90">{part.slice(1, -1)}</em>;
    }

    // Regular Text
    return <span key={index}>{part}</span>;
  });
};

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // First split by code blocks to isolate them from other processing
  const parts = content.split(/```/);

  return (
    <div className="space-y-3 text-[15px] leading-relaxed break-words">
      {parts.map((part, index) => {
        if (index % 2 === 1) {
          // --- Code Block Processing ---
          const firstLineBreak = part.indexOf('\n');
          const language = firstLineBreak > 0 ? part.substring(0, firstLineBreak).trim() : '';
          const code = firstLineBreak > 0 ? part.substring(firstLineBreak + 1) : part;

          return (
            <div key={index} className="relative rounded-lg overflow-hidden my-3 bg-[#1D1B20] border border-[#49454F]">
              {language && (
                <div className="bg-[#2B2930] px-4 py-1.5 text-xs text-[#CAC4D0] border-b border-[#49454F] flex justify-between items-center font-medium">
                    <span>{language}</span>
                    <span className="text-[10px] uppercase opacity-60">Code</span>
                </div>
              )}
              <pre className="p-4 overflow-x-auto custom-scrollbar">
                <code className="text-sm font-mono text-[#E6E0E9] whitespace-pre">
                  {code}
                </code>
              </pre>
            </div>
          );
        } else {
          // --- Text Block Processing ---
          // We handle lists and paragraphs here
          const lines = part.split('\n');
          const elements: React.ReactNode[] = [];
          let currentList: React.ReactNode[] = [];
          let isOrdered = false;
          let inList = false;

          lines.forEach((line, i) => {
             const trimLine = line.trim();
             
             // Handle empty lines
             if (!trimLine) {
                 // If we were in a list, close it
                 if (inList) {
                     const ListTag = isOrdered ? 'ol' : 'ul';
                     elements.push(
                         <ListTag key={`list-${i}`} className={`mb-3 pl-5 space-y-1 ${isOrdered ? 'list-decimal' : 'list-disc'} marker:text-[#CAC4D0]`}>
                             {currentList}
                         </ListTag>
                     );
                     currentList = [];
                     inList = false;
                 }
                 // Add spacer for double newlines (paragraphs)
                 if (i < lines.length - 1) elements.push(<div key={`br-${i}`} className="h-2" />);
                 return;
             }

             // Check for list items
             // Matches "- Item", "* Item", "1. Item"
             const unorderedMatch = line.match(/^[-*]\s+(.*)/);
             const orderedMatch = line.match(/^(\d+)\.\s+(.*)/);

             if (unorderedMatch || orderedMatch) {
                 const match = unorderedMatch || orderedMatch;
                 const content = match![match!.length - 1]; // content is last group
                 
                 // State transitions for lists
                 if (!inList) {
                     // Start new list
                     inList = true;
                     isOrdered = !!orderedMatch;
                 } else if (isOrdered !== !!orderedMatch) {
                     // List type changed (ul -> ol or vice versa), close old and start new
                     const ListTag = isOrdered ? 'ol' : 'ul';
                     elements.push(
                         <ListTag key={`list-switch-${i}`} className={`mb-3 pl-5 space-y-1 ${isOrdered ? 'list-decimal' : 'list-disc'} marker:text-[#CAC4D0]`}>
                             {currentList}
                         </ListTag>
                     );
                     currentList = [];
                     isOrdered = !!orderedMatch;
                 }

                 currentList.push(<li key={`li-${i}`} className="pl-1">{parseInline(content)}</li>);
             } else {
                 // Not a list item
                 if (inList) {
                     // Close pending list
                     const ListTag = isOrdered ? 'ol' : 'ul';
                     elements.push(
                         <ListTag key={`list-end-${i}`} className={`mb-3 pl-5 space-y-1 ${isOrdered ? 'list-decimal' : 'list-disc'} marker:text-[#CAC4D0]`}>
                             {currentList}
                         </ListTag>
                     );
                     currentList = [];
                     inList = false;
                 }

                 // Check for Headers
                 const headerMatch = line.match(/^(#{1,6})\s+(.*)/);
                 if (headerMatch) {
                     const level = headerMatch[1].length;
                     const text = headerMatch[2];
                     // Tailwind classes for headers
                     const sizeClass = level === 1 ? 'text-2xl font-bold mb-3 mt-4 text-[#E6E0E9]' : 
                                     level === 2 ? 'text-xl font-bold mb-2 mt-3 text-[#E6E0E9]' : 
                                     'text-lg font-bold mb-2 mt-2 text-[#E6E0E9]';
                     elements.push(<div key={`h-${i}`} className={sizeClass}>{parseInline(text)}</div>);
                 } else {
                     // Regular paragraph line
                     elements.push(<div key={`p-${i}`} className="min-h-[1.5em]">{parseInline(line)}</div>);
                 }
             }
          });

          // Flush any remaining list at end of block
          if (inList) {
              const ListTag = isOrdered ? 'ol' : 'ul';
              elements.push(
                  <ListTag key={`list-final`} className={`mb-3 pl-5 space-y-1 ${isOrdered ? 'list-decimal' : 'list-disc'} marker:text-[#CAC4D0]`}>
                      {currentList}
                  </ListTag>
              );
          }

          return <div key={index}>{elements}</div>;
        }
      })}
    </div>
  );
};

export default MarkdownRenderer;