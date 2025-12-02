import React from 'react';
import { Message, Role } from '../types';
import { UserIcon } from './Icons';
import MarkdownRenderer from './MarkdownRenderer';

interface MessageBubbleProps {
  message: Message;
  theme?: 'light' | 'dark';
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, theme = 'dark' }) => {
  const isUser = message.role === Role.USER;

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-4 group`}>
      <div className={`flex max-w-[85%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`
          flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center self-start mt-0.5 transition-colors
          ${isUser 
            ? 'bg-[#D0BCFF] text-[#381E72]' 
            : theme === 'light'
            ? 'bg-gray-200 text-gray-700'
            : 'bg-[#2B2930] text-[#E6E0E9]'
          }
        `}>
          {isUser && <UserIcon size={16} />}
          {!isUser && <span className="text-xs font-semibold">AI</span>}
        </div>

        {/* Content Bubble */}
        <div className={`
            flex-1 min-w-0 flex flex-col
            ${isUser ? 'items-end' : 'items-start'}
        `}>
            <div className={`
                px-4 py-2.5 text-sm leading-relaxed rounded-lg transition-colors
                ${isUser 
                  ? 'bg-[#D0BCFF] text-[#381E72]' 
                  : theme === 'light'
                  ? 'bg-gray-100 text-gray-900'
                  : 'bg-[#2B2930] text-[#E6E0E9]'
                }
            `}>
                {isUser ? (
                    <div className="whitespace-pre-wrap">{message.content}</div>
                ) : (
                    <MarkdownRenderer content={message.content} />
                )}
            </div>
        </div>

      </div>
    </div>
  );
};

export default MessageBubble;