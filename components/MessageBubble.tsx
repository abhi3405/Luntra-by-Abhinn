import React, { useState } from 'react';
import { Message, Role } from '../types';
import MarkdownRenderer from './MarkdownRenderer';
import { CopyIcon, BookmarkIcon, DeleteIcon, RefreshIcon } from './Icons';

interface MessageBubbleProps {
  message: Message;
  theme?: 'light' | 'dark';
  onDelete?: (id: string) => void;
  onBookmark?: (id: string) => void;
  onRegenerate?: (id: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  theme = 'dark',
  onDelete,
  onBookmark,
  onRegenerate
}) => {
  const isUser = message.role === Role.USER;
  const [copied, setCopied] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6 animate-fadeIn`}>
      <div className={`flex max-w-2xl gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} w-full`}>
        
        {/* Avatar */}
        <div className={`
          flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center self-start mt-1 text-xs font-bold transition-all
          ${isUser 
            ? theme === 'light'
              ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white'
              : 'bg-gradient-to-br from-green-400 to-blue-500 text-white'
            : theme === 'light'
            ? 'bg-gradient-to-br from-purple-400 to-pink-400 text-white'
            : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
          }
        `}>
          {isUser ? '👤' : '🤖'}
        </div>

        {/* Message Container */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} gap-2 flex-1`}>
          
          {/* Content Bubble */}
          <div
            className={`
              group relative px-5 py-4 text-sm leading-relaxed rounded-2xl transition-all transform hover:scale-[1.01]
              ${isUser 
                ? `${theme === 'light' ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-blue-600 to-blue-700'} text-white rounded-br-none shadow-md` 
                : theme === 'light'
                ? 'bg-slate-100 text-slate-900 rounded-bl-none max-w-xs md:max-w-2xl'
                : 'bg-slate-800/50 text-slate-100 rounded-bl-none backdrop-blur-sm border border-slate-700/30 max-w-xs md:max-w-2xl'
              }
            `}
            onMouseEnter={() => !isUser && setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
          >
            {isUser ? (
              <div className="whitespace-pre-wrap break-words">{message.content}</div>
            ) : (
              <MarkdownRenderer content={message.content} />
            )}

            {/* Streaming indicator */}
            {message.isStreaming && (
              <div className="flex gap-1 mt-3">
                <div className={`w-2 h-2 rounded-full animate-pulse ${theme === 'light' ? 'bg-slate-700' : 'bg-slate-300'}`}></div>
                <div className={`w-2 h-2 rounded-full animate-pulse ${theme === 'light' ? 'bg-slate-700' : 'bg-slate-300'}`} style={{animationDelay: '0.1s'}}></div>
                <div className={`w-2 h-2 rounded-full animate-pulse ${theme === 'light' ? 'bg-slate-700' : 'bg-slate-300'}`} style={{animationDelay: '0.2s'}}></div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {!isUser && showActions && (
            <div className="flex gap-2 px-2 opacity-100 transition-opacity">
              <button
                onClick={handleCopy}
                className={`p-2 rounded-lg transition-all hover:scale-110 ${
                  theme === 'light'
                    ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
                title="Copy"
              >
                <CopyIcon size={14} />
              </button>
              {onBookmark && (
                <button
                  onClick={() => onBookmark(message.id)}
                  className={`p-2 rounded-lg transition-all hover:scale-110 ${
                    message.bookmarked
                      ? theme === 'light'
                        ? 'bg-yellow-200 text-yellow-700'
                        : 'bg-yellow-900/40 text-yellow-400'
                      : theme === 'light'
                      ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <BookmarkIcon size={14} />
                </button>
              )}
              {onRegenerate && (
                <button
                  onClick={() => onRegenerate(message.id)}
                  className={`p-2 rounded-lg transition-all hover:scale-110 ${
                    theme === 'light'
                      ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <RefreshIcon size={14} />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(message.id)}
                  className={`p-2 rounded-lg transition-all hover:scale-110 ${
                    theme === 'light'
                      ? 'bg-red-200 text-red-700 hover:bg-red-300'
                      : 'bg-red-900/40 text-red-400 hover:bg-red-900/60'
                  }`}
                >
                  <DeleteIcon size={14} />
                </button>
              )}
            </div>
          )}

          {/* Timestamp */}
          <div className={`text-xs opacity-60 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
            {formatTime(message.timestamp)}
            {message.edited && ' (edited)'}
            {copied && ' ✓ Copied!'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
