import React, { useState, useRef, useEffect } from 'react';
import { Message, Role } from './types';
import * as geminiService from './services/geminiService';
import MessageBubble from './components/MessageBubble';
import { SendIcon, MoonIcon, SunIcon } from './components/Icons';
import { useTheme } from './context/ThemeContext';

function App() {
  const { theme, toggleTheme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] =  useState(false);
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
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={`flex h-screen overflow-hidden transition-colors duration-300 ${
      theme === 'light' 
        ? 'bg-white text-gray-900' 
        : 'bg-[#141218] text-[#E6E0E9]'
    }`}>
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full relative w-full">
        
        {/* Top Header with Logo and New Chat button */}
        <div className={`flex items-center justify-between px-4 py-4 z-10 sticky top-0 border-b transition-colors duration-300 ${
          theme === 'light'
            ? 'bg-white border-gray-200'
            : 'bg-[#141218] border-[#49454F]/20'
        }`}>
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="Luntra" className={`h-8 w-8 ${theme === 'light' ? 'invert' : ''}`} />
              <h1 className="text-xl font-semibold">Luntra</h1>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'light'
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-[#2B2930] text-[#E6E0E9] hover:bg-[#36343B]'
                }`}
              >
                {theme === 'light' ? <MoonIcon size={20} /> : <SunIcon size={20} />}
              </button>
              <button 
                onClick={handleNewChat}
                className="px-4 py-2 text-sm font-medium bg-[#D0BCFF] text-[#381E72] rounded-lg hover:bg-[#E8DEF8] transition-colors"
              >
                New Chat
              </button>
            </div>
        </div>

        {/* Messages Container */}
        <div className={`flex-1 overflow-y-auto custom-scrollbar scroll-smooth ${
          theme === 'light' ? 'bg-white' : 'bg-[#141218]'
        }`}>
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center">
              <h2 className="text-3xl md:text-4xl font-semibold mb-3">How can I help?</h2>
              <p className={`text-base max-w-md mb-8 ${
                theme === 'light' ? 'text-gray-600' : 'text-[#CAC4D0]'
              }`}>
                Ask me anything or start a new conversation.
              </p>
              
              {/* Suggestion Chips */}
              <div className="flex flex-wrap justify-center gap-3 max-w-2xl">
                 {['Summarize a text', 'Write python code', 'Design a logo concept'].map(text => (
                    <button 
                        key={text} 
                        onClick={() => { setInputValue(text); if(textareaRef.current) textareaRef.current.focus(); }}
                        className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                          theme === 'light'
                            ? 'bg-gray-100 border border-gray-300 text-gray-900 hover:bg-gray-200'
                            : 'bg-[#2B2930] hover:bg-[#36343B] border border-[#49454F] text-[#E6E0E9]'
                        }`}
                    >
                        {text}
                    </button>
                 ))}
              </div>
            </div>
          ) : (
            <div className={`flex flex-col py-6 md:py-8 max-w-3xl mx-auto w-full px-4 md:px-0 ${
              theme === 'light' ? 'bg-white' : 'bg-[#141218]'
            }`}>
              {messages.map(msg => (
                <MessageBubble key={msg.id} message={msg} theme={theme} />
              ))}
              {isTyping && messages[messages.length - 1]?.role === Role.USER && (
                  <div className="flex w-full justify-start mb-4 animate-pulse">
                      <div className="flex gap-3">
                          <div className={`rounded-lg px-4 py-3 flex items-center space-x-1.5 ${
                            theme === 'light'
                              ? 'bg-gray-100'
                              : 'bg-[#2B2930]'
                          }`}>
                              <div className={`w-1.5 h-1.5 rounded-full animate-bounce ${
                                theme === 'light' ? 'bg-gray-600' : 'bg-[#E6E0E9]'
                              }`} style={{ animationDelay: '0ms' }}></div>
                              <div className={`w-1.5 h-1.5 rounded-full animate-bounce ${
                                theme === 'light' ? 'bg-gray-600' : 'bg-[#E6E0E9]'
                              }`} style={{ animationDelay: '150ms' }}></div>
                              <div className={`w-1.5 h-1.5 rounded-full animate-bounce ${
                                theme === 'light' ? 'bg-gray-600' : 'bg-[#E6E0E9]'
                              }`} style={{ animationDelay: '300ms' }}></div>
                          </div>
                      </div>
                  </div>
              )}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className={`flex-shrink-0 p-4 pb-6 w-full transition-colors duration-300 ${
          theme === 'light' ? 'bg-white' : 'bg-[#141218]'
        }`}>
          <div className={`max-w-3xl mx-auto relative rounded-lg transition-all duration-200 border ${
            theme === 'light'
              ? 'bg-white border-gray-300 focus-within:border-blue-500'
              : 'bg-[#2B2930] border-[#49454F] focus-within:bg-[#36343B]'
          }`}>
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className={`w-full rounded-lg pl-4 pr-14 py-3 focus:outline-none resize-none overflow-hidden max-h-[150px] text-sm leading-5 bg-transparent ${
                theme === 'light'
                  ? 'text-gray-900 placeholder-gray-500'
                  : 'text-[#E6E0E9] placeholder-[#79747E]'
              }`}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              className={`
                absolute right-2 bottom-2.5 w-8 h-8 rounded-md flex items-center justify-center transition-all duration-200
                ${!inputValue.trim() || isTyping 
                  ? theme === 'light'
                    ? 'bg-transparent text-gray-400 cursor-not-allowed'
                    : 'bg-transparent text-[#79747E] cursor-not-allowed'
                  : 'bg-[#D0BCFF] text-[#381E72] hover:bg-[#E8DEF8]'
                }
              `}
            >
              <SendIcon size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;