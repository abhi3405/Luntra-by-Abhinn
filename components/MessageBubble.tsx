import React from 'react';
import { Message, Role } from '../types';
import { BotIcon, UserIcon, SparkleIcon } from './Icons';
import MarkdownRenderer from './MarkdownRenderer';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === Role.USER;

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-4 px-4 md:px-0 group`}>
      <div className={`flex max-w-[90%] md:max-w-3xl gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`
          flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center self-start mt-1 shadow-sm
          ${isUser ? 'bg-[#D0BCFF] text-[#381E72]' : 'bg-transparent text-[#D0BCFF]'}
        `}>
          {isUser ? <UserIcon size={16} /> : <SparkleIcon size={20} />}
        </div>

        {/* Content Bubble */}
        <div className={`
            flex-1 min-w-0 flex flex-col
            ${isUser ? 'items-end' : 'items-start'}
        `}>
            {/* Name Label - Only show for Bot on first message of group potentially, simplified here */}
            {!isUser && <div className="text-[11px] text-[#CAC4D0] mb-1 ml-1">Luntra</div>}

            <div className={`
                px-5 py-3.5 text-[15px] leading-relaxed shadow-sm
                ${isUser 
                  ? 'bg-[#4F378B] text-[#EADDFF] rounded-[20px] rounded-tr-sm' 
                  : 'bg-[#2B2930] text-[#E6E0E9] rounded-[20px] rounded-tl-sm'
                }
            `}>
                {isUser ? (
                    <div className="whitespace-pre-wrap">{message.content}</div>
                ) : (
                    <MarkdownRenderer content={message.content} />
                )}
            </div>
            
            {/* Timestamp or Status (Optional) */}
            {/* <div className="text-[10px] text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </div> */}
        </div>

      </div>
    </div>
  );
};

export default MessageBubble;