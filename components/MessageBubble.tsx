import React from 'react';
import { Message, Role } from '../types';
import MarkdownRenderer from './MarkdownRenderer';

interface MessageBubbleProps {
  message: Message;
  theme?: 'light' | 'dark';
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, theme = 'dark' }) => {
  const isUser = message.role === Role.USER;

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex max-w-2xl gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar - One UI Style */}
        <div className={`
          flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center self-start mt-1 text-xs font-semibold transition-all
          ${isUser 
            ? theme === 'light'
              ? 'bg-gradient-to-br from-blue-400 to-cyan-400 text-white'
              : 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white'
            : theme === 'light'
            ? 'bg-slate-200 text-slate-800'
            : 'bg-slate-800 text-slate-200'
          }
        `}>
          {isUser ? 'U' : 'L'}
        </div>

        {/* Content Bubble - One UI Style */}
        <div className={`
            px-5 py-3.5 text-sm leading-relaxed rounded-3xl transition-all
            ${isUser 
              ? `${theme === 'light' ? 'bg-blue-500' : 'bg-blue-600'} text-white rounded-br-none` 
              : theme === 'light'
              ? 'bg-slate-100 text-slate-900 rounded-bl-none'
              : 'bg-slate-900 text-white rounded-bl-none'
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
  );
};

export default MessageBubble;