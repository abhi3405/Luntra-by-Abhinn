import React, { useState, useRef, useEffect } from 'react';
import { Message, Role } from './types';
import * as geminiService from './services/geminiService';
import MessageBubble from './components/MessageBubble';
import Sidebar from './components/Sidebar';
import { SendIcon, MenuIcon, SparkleIcon } from './components/Icons';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Initialize chat on mount
    geminiService.initChatSession();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [inputValue]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      content: inputValue.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setIsTyping(true);

    try {
      // Create a placeholder for the bot message
      const botMessageId = (Date.now() + 1).toString();
      const botMessage: Message = {
        id: botMessageId,
        role: Role.MODEL,
        content: '',
        timestamp: Date.now(),
        isStreaming: true
      };
      
      setMessages(prev => [...prev, botMessage]);

      const stream = geminiService.sendMessageStream(userMessage.content);
      
      let fullContent = '';

      for await (const chunk of stream) {
        fullContent += chunk;
        setMessages(prev => 
          prev.map(msg => 
            msg.id === botMessageId 
              ? { ...msg, content: fullContent } 
              : msg
          )
        );
      }
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === botMessageId 
            ? { ...msg, isStreaming: false } 
            : msg
        )
      );

    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleNewChat = () => {
    geminiService.initChatSession();
    setMessages([]);
    setInputValue('');
    setIsTyping(false);
    if(window.innerWidth < 768) setSidebarOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-[#141218] overflow-hidden text-[#E6E0E9]">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
        onNewChat={handleNewChat} 
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full relative w-full transition-all duration-300">
        
        {/* Top App Bar (Mobile) */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#141218] z-10 sticky top-0 border-b border-[#49454F]/20">
            <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-[#CAC4D0] hover:bg-[#49454F]/20 rounded-full">
                <MenuIcon size={24} />
            </button>
            <div className="flex items-center gap-2">
                 <SparkleIcon size={18} className="text-[#D0BCFF]" />
                 <span className="font-medium text-lg text-[#E6E0E9]">Luntra</span>
            </div>
            <div className="w-10" /> 
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto custom-scrollbar scroll-smooth">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center animate-[fadeIn_0.5s_ease-out_forwards]">
               <div className="w-20 h-20 bg-[#2B2930] rounded-[28px] flex items-center justify-center mb-6 shadow-none">
                    <SparkleIcon size={40} className="text-[#D0BCFF]" />
                </div>
              <h2 className="text-3xl md:text-4xl font-normal mb-3 text-[#E6E0E9]">Hello</h2>
              <p className="text-[#CAC4D0] text-lg max-w-md mb-8">
                I'm Luntra. How can I help you be productive today?
              </p>
              
              {/* Suggestion Chips - Material 3 Style */}
              <div className="flex flex-wrap justify-center gap-3 max-w-2xl">
                 {['Summarize a text', 'Write python code', 'Design a logo concept'].map(text => (
                    <button 
                        key={text} 
                        onClick={() => { setInputValue(text); if(textareaRef.current) textareaRef.current.focus(); }}
                        className="px-5 py-2.5 bg-[#1D1B20] hover:bg-[#2B2930] border border-[#49454F] rounded-lg text-sm font-medium text-[#E6E0E9] transition-colors"
                    >
                        {text}
                    </button>
                 ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col py-6 md:py-8 max-w-3xl mx-auto w-full">
              {messages.map(msg => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              {isTyping && messages[messages.length - 1]?.role === Role.USER && (
                  <div className="flex w-full justify-start mb-4 px-4 md:px-0 animate-pulse">
                      <div className="flex max-w-3xl gap-3">
                           <div className="flex-shrink-0 w-8 h-8 rounded-full bg-transparent flex items-center justify-center self-start mt-1 text-[#D0BCFF]">
                              <SparkleIcon size={20} />
                          </div>
                          <div className="bg-[#2B2930] rounded-[20px] rounded-tl-sm px-5 py-4 flex items-center space-x-1.5">
                              <div className="w-1.5 h-1.5 bg-[#E6E0E9] rounded-full animate-bounce delay-75"></div>
                              <div className="w-1.5 h-1.5 bg-[#E6E0E9] rounded-full animate-bounce delay-150"></div>
                              <div className="w-1.5 h-1.5 bg-[#E6E0E9] rounded-full animate-bounce delay-300"></div>
                          </div>
                      </div>
                  </div>
              )}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}
        </div>

        {/* Floating Input Area - Material You Style */}
        <div className="flex-shrink-0 p-4 pb-6 w-full bg-[#141218]">
          <div className="max-w-3xl mx-auto relative bg-[#2B2930] rounded-[32px] transition-all duration-200 focus-within:bg-[#36343B]">
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message Luntra..."
              className="w-full bg-transparent text-[#E6E0E9] rounded-[32px] pl-6 pr-16 py-4 focus:outline-none resize-none overflow-hidden max-h-[150px] placeholder-[#CAC4D0] leading-6"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              className={`
                absolute right-2 bottom-2 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200
                ${!inputValue.trim() || isTyping 
                  ? 'bg-transparent text-[#79747E]' 
                  : 'bg-[#D0BCFF] text-[#381E72] hover:bg-[#E8DEF8] hover:shadow-md'
                }
              `}
            >
              <SendIcon size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;