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
    <div className={`flex h-screen overflow-hidden transition-all duration-500 ${
      theme === 'light' 
        ? 'bg-white text-slate-900' 
        : 'bg-black text-white'
    }`}>
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full relative w-full">
        
        {/* Header - One UI Style */}
        <div className={`flex items-center justify-between px-5 py-4 transition-all duration-300 backdrop-blur-lg ${
          theme === 'light'
            ? 'bg-white/95 border-b border-slate-100'
            : 'bg-black/95 border-b border-slate-900'
        }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full transition-all transform hover:scale-110 active:scale-95 ${
                theme === 'light'
                  ? 'bg-blue-100'
                  : 'bg-slate-900'
              }`}>
                <div className={`h-6 w-6 flex items-center justify-center ${
                  theme === 'light'
                    ? 'text-blue-700'
                    : 'text-blue-400'
                }`}>
                  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" fill="currentColor" stroke="currentColor">
                    <path d="M 100 15 C 150 15 185 50 185 100 C 185 150 150 185 100 185 C 88 185 77 183 67 179 L 25 205 L 50 155 C 30 138 18 115 18 100 C 18 50 53 15 100 15 Z" 
                          fill="none" strokeWidth="10" strokeLinejoin="round" strokeLinecap="round"/>
                    <line x1="50" y1="55" x2="145" y2="55" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="50" y1="70" x2="145" y2="70" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="65" cy="70" r="3.5" fill="currentColor"/>
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-lg font-semibold">Luntra</h1>
                <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>AI Assistant</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={toggleTheme}
                className={`p-2.5 rounded-full transition-all transform hover:scale-110 active:scale-95 ${
                  theme === 'light'
                    ? 'bg-slate-100 text-slate-700'
                    : 'bg-slate-900 text-slate-300'
                }`}
              >
                {theme === 'light' ? <MoonIcon size={18} /> : <SunIcon size={18} />}
              </button>
              <button 
                onClick={handleNewChat}
                className={`px-4 py-2.5 text-sm font-semibold rounded-full transition-all transform hover:scale-105 active:scale-95 ${
                  theme === 'light'
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                New
              </button>
            </div>
        </div>

        {/* Messages Container - One UI */}
        <div className={`flex-1 overflow-y-auto custom-scrollbar scroll-smooth transition-colors duration-300`}>
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center">
              <div className={`w-24 h-24 rounded-3xl mb-8 flex items-center justify-center transition-all transform hover:scale-110 ${
                theme === 'light'
                  ? 'bg-blue-100 shadow-lg'
                  : 'bg-slate-900 shadow-xl shadow-blue-500/10'
              }`}>
                <div className={`h-14 w-14 flex items-center justify-center ${
                  theme === 'light'
                    ? 'text-blue-700'
                    : 'text-blue-400'
                }`}>
                  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" fill="currentColor" stroke="currentColor">
                    <path d="M 100 15 C 150 15 185 50 185 100 C 185 150 150 185 100 185 C 88 185 77 183 67 179 L 25 205 L 50 155 C 30 138 18 115 18 100 C 18 50 53 15 100 15 Z" 
                          fill="none" strokeWidth="10" strokeLinejoin="round" strokeLinecap="round"/>
                    <line x1="50" y1="55" x2="145" y2="55" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
              <h2 className="text-5xl font-bold mb-4">How can I help?</h2>
              <p className={`text-base max-w-md ${
                theme === 'light' ? 'text-slate-500' : 'text-slate-400'
              }`}>
                Ask me anything or start a new conversation.
              </p>
            </div>
          ) : (
            <div className="flex flex-col py-6 md:py-8 max-w-3xl mx-auto w-full px-4 md:px-0">
              {messages.map(msg => (
                <MessageBubble key={msg.id} message={msg} theme={theme} />
              ))}
              {isTyping && messages[messages.length - 1]?.role === Role.USER && (
                  <div className="flex w-full justify-start mb-4">
                      <div className="flex gap-2">
                          <div className={`rounded-2xl px-5 py-3 flex items-center space-x-1.5 ${
                            theme === 'light'
                              ? 'bg-slate-100'
                              : 'bg-slate-900'
                          }`}>
                              <div className={`w-2.5 h-2.5 rounded-full animate-bounce ${
                                theme === 'light' ? 'bg-slate-600' : 'bg-slate-300'
                              }`} style={{ animationDelay: '0ms' }}></div>
                              <div className={`w-2.5 h-2.5 rounded-full animate-bounce ${
                                theme === 'light' ? 'bg-slate-600' : 'bg-slate-300'
                              }`} style={{ animationDelay: '150ms' }}></div>
                              <div className={`w-2.5 h-2.5 rounded-full animate-bounce ${
                                theme === 'light' ? 'bg-slate-600' : 'bg-slate-300'
                              }`} style={{ animationDelay: '300ms' }}></div>
                          </div>
                      </div>
                  </div>
              )}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}
        </div>

        {/* Input Area - One UI Style */}
        <div className={`flex-shrink-0 p-5 pb-7 w-full transition-all duration-300`}>
          <div className={`max-w-3xl mx-auto relative rounded-3xl transition-all duration-200 ${
            theme === 'light'
              ? 'bg-slate-100 shadow-md'
              : 'bg-slate-900 shadow-lg'
          }`}>
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className={`w-full rounded-3xl pl-6 pr-16 py-4 focus:outline-none resize-none overflow-hidden max-h-[150px] text-sm leading-6 bg-transparent ${
                theme === 'light'
                  ? 'text-slate-900 placeholder-slate-400'
                  : 'text-white placeholder-slate-500'
              }`}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              className={`
                absolute right-2 bottom-2.5 w-10 h-10 rounded-full flex items-center justify-center transition-all transform hover:scale-110 active:scale-90
                ${!inputValue.trim() || isTyping 
                  ? theme === 'light'
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                  : theme === 'light'
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
                }
              `}
            >
              <SendIcon size={20} />
            </button>
          </div>
          
          {/* Footer with designer credit */}
          <div className="max-w-3xl mx-auto mt-4 text-center">
            <p className={`text-xs font-medium tracking-wider transition-all opacity-60 hover:opacity-100 ${
              theme === 'light' 
                ? 'text-slate-500' 
                : 'text-slate-400'
            }`}>
              Designed by Abhinn©
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;