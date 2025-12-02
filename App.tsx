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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem('searchHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [conversations, setConversations] = useState<Array<{id: string; title: string; timestamp: number}>>(() => {
    const saved = localStorage.getItem('conversations');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem('preferences');
    return saved ? JSON.parse(saved) : {
      fontSize: 'base',
      messageAnimations: true,
      soundNotifications: false,
      responseLength: 'medium',
      creativityLevel: 0.7,
      showTimestamps: false,
      autoSave: true,
      compactMode: false
    };
  });
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

  // Save search history to localStorage
  useEffect(() => {
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
  }, [searchHistory]);

  // Save conversations to localStorage
  useEffect(() => {
    localStorage.setItem('conversations', JSON.stringify(conversations));
  }, [conversations]);

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('preferences', JSON.stringify(preferences));
  }, [preferences]);

  const addToHistory = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setSearchHistory(prev => {
      const filtered = prev.filter(item => item !== trimmed);
      return [trimmed, ...filtered].slice(0, 15);
    });
  };

  const clearHistory = () => {
    setSearchHistory([]);
  };

  const removeHistoryItem = (item: string) => {
    setSearchHistory(prev => prev.filter(h => h !== item));
  };

  const selectFromHistory = (query: string) => {
    setInputValue(query);
  };

  const saveConversation = () => {
    if (messages.length === 0) return;
    const firstMessage = messages[0]?.content || 'Untitled';
    const title = firstMessage.substring(0, 50) + (firstMessage.length > 50 ? '...' : '');
    const id = Date.now().toString();
    setConversations(prev => [{ id, title, timestamp: Date.now() }, ...prev]);
    setCurrentConversationId(id);
  };

  const deleteConversation = (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (currentConversationId === id) {
      setCurrentConversationId(null);
      setMessages([]);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportChat = (format: 'txt' | 'json' | 'md') => {
    let content = '';
    const title = `Chat Export - ${new Date().toLocaleDateString()}`;

    if (format === 'txt') {
      content = `${title}\n${'='.repeat(50)}\n\n`;
      messages.forEach(msg => {
        content += `${msg.role === Role.USER ? 'You' : 'Assistant'}: ${msg.content}\n\n`;
      });
    } else if (format === 'json') {
      content = JSON.stringify({ title, messages }, null, 2);
    } else if (format === 'md') {
      content = `# ${title}\n\n`;
      messages.forEach(msg => {
        const sender = msg.role === Role.USER ? '**You**' : '**Assistant**';
        content += `${sender}: ${msg.content}\n\n`;
      });
    }

    const element = document.createElement('a');
    element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`);
    element.setAttribute('download', `chat-export.${format}`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setShowExportMenu(false);
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure? This will delete all conversations and history.')) {
      setMessages([]);
      setConversations([]);
      setSearchHistory([]);
      setCurrentConversationId(null);
      handleNewChat();
    }
  };

  const filteredMessages = messages.filter(msg =>
    msg.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      content: inputValue.trim(),
      timestamp: Date.now(),
    };

    addToHistory(inputValue.trim());
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
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 overflow-hidden ${
        theme === 'light'
          ? 'bg-slate-50 border-r border-slate-200'
          : 'bg-slate-950 border-r border-slate-800'
      } flex flex-col`}>
        {/* Sidebar Header */}
        <div className={`p-4 border-b ${theme === 'light' ? 'border-slate-200' : 'border-slate-800'}`}>
          <button
            onClick={handleNewChat}
            className={`w-full px-3 py-2 rounded-lg text-sm font-semibold transition-all transform hover:scale-105 active:scale-95 ${
              theme === 'light'
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            + New Chat
          </button>
        </div>

        {/* Conversations Section */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
          {conversations.length > 0 && (
            <div className="mb-6">
              <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${
                theme === 'light' ? 'text-slate-600' : 'text-slate-400'
              }`}>
                Conversations
              </h3>
              <div className="space-y-2">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => {
                      setCurrentConversationId(conv.id);
                      setMessages([]);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all group truncate ${
                      currentConversationId === conv.id
                        ? theme === 'light'
                          ? 'bg-blue-100 text-blue-900'
                          : 'bg-blue-900 text-blue-100'
                        : theme === 'light'
                        ? 'text-slate-700 hover:bg-slate-200'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                    title={conv.title}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate flex-1">{conv.title}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversation(conv.id);
                        }}
                        className={`ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs ${
                          theme === 'light' ? 'text-slate-500' : 'text-slate-500'
                        }`}
                      >
                        ×
                      </button>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* History Section */}
          {searchHistory.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className={`text-xs font-bold uppercase tracking-wider ${
                  theme === 'light' ? 'text-slate-600' : 'text-slate-400'
                }`}>
                  History
                </h3>
                <button
                  onClick={clearHistory}
                  className={`text-xs px-2 py-1 rounded transition-all hover:scale-110 ${
                    theme === 'light'
                      ? 'text-red-600 hover:bg-red-50'
                      : 'text-red-400 hover:bg-red-900/20'
                  }`}
                >
                  Clear
                </button>
              </div>
              <div className="space-y-2">
                {searchHistory.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => selectFromHistory(item)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all group truncate ${
                      theme === 'light'
                        ? 'text-slate-700 hover:bg-slate-200'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                    title={item}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate flex-1">{item}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeHistoryItem(item);
                        }}
                        className={`ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs ${
                          theme === 'light' ? 'text-slate-500' : 'text-slate-500'
                        }`}
                      >
                        ×
                      </button>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Settings Section */}
        <div className={`p-4 border-t ${theme === 'light' ? 'border-slate-200' : 'border-slate-800'}`}>
          <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${
            theme === 'light' ? 'text-slate-600' : 'text-slate-400'
          }`}>
            Settings
          </h3>
          <div className="space-y-2">
            <button
              onClick={toggleTheme}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                theme === 'light'
                  ? 'text-slate-700 hover:bg-slate-200'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {theme === 'light' ? <MoonIcon size={16} /> : <SunIcon size={16} />}
              <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
            </button>
            <button
              onClick={() => setShowPreferences(true)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                theme === 'light'
                  ? 'text-slate-700 hover:bg-slate-200'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span>⚙️</span>
              <span>Preferences</span>
            </button>
            <button
              onClick={() => setShowAbout(true)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                theme === 'light'
                  ? 'text-slate-700 hover:bg-slate-200'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span>ℹ️</span>
              <span>About</span>
            </button>
          </div>
        </div>
      </div>

      {/* Toggle Sidebar Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={`absolute left-0 top-4 z-50 p-2 rounded-r-lg transition-all transform hover:scale-110 active:scale-95 ${
          theme === 'light'
            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
        }`}
        style={{ left: sidebarOpen ? '256px' : '0' }}
      >
        {sidebarOpen ? '◀' : '▶'}
      </button>

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
                  <svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="120" cy="120" r="105" strokeWidth="3.5"/>
                    <circle cx="120" cy="60" r="9" fill="currentColor"/>
                    <circle cx="165" cy="85" r="7" fill="currentColor"/>
                    <circle cx="190" cy="130" r="7" fill="currentColor"/>
                    <circle cx="165" cy="175" r="7" fill="currentColor"/>
                    <circle cx="120" cy="200" r="9" fill="currentColor"/>
                    <circle cx="75" cy="175" r="7" fill="currentColor"/>
                    <circle cx="50" cy="130" r="7" fill="currentColor"/>
                    <circle cx="75" cy="85" r="7" fill="currentColor"/>
                    <line x1="120" y1="60" x2="165" y2="85"/>
                    <line x1="165" y1="85" x2="190" y2="130"/>
                    <line x1="190" y1="130" x2="165" y2="175"/>
                    <line x1="165" y1="175" x2="120" y2="200"/>
                    <line x1="120" y1="200" x2="75" y2="175"/>
                    <line x1="75" y1="175" x2="50" y2="130"/>
                    <line x1="50" y1="130" x2="75" y2="85"/>
                    <line x1="75" y1="85" x2="120" y2="60"/>
                    <line x1="120" y1="60" x2="120" y2="120"/>
                    <line x1="165" y1="85" x2="120" y2="120"/>
                    <line x1="190" y1="130" x2="120" y2="120"/>
                    <line x1="165" y1="175" x2="120" y2="120"/>
                    <line x1="120" y1="200" x2="120" y2="120"/>
                    <line x1="75" y1="175" x2="120" y2="120"/>
                    <line x1="50" y1="130" x2="120" y2="120"/>
                    <line x1="75" y1="85" x2="120" y2="120"/>
                    <circle cx="120" cy="50" r="2" fill="currentColor"/>
                    <circle cx="150" cy="52" r="1.5" fill="currentColor"/>
                    <line x1="150" y1="45" x2="150" y2="52" strokeWidth="1.5"/>
                    <line x1="145" y1="48" x2="155" y2="48" strokeWidth="1.5"/>
                    <line x1="210" y1="115" x2="210" y2="125" strokeWidth="1.5"/>
                    <line x1="205" y1="120" x2="215" y2="120" strokeWidth="1.5"/>
                    <circle cx="210" cy="120" r="1.5" fill="currentColor"/>
                    <circle cx="218" cy="100" r="1" fill="currentColor"/>
                    <line x1="210" y1="188" x2="210" y2="195" strokeWidth="1.5"/>
                    <line x1="205" y1="192" x2="215" y2="192" strokeWidth="1.5"/>
                    <circle cx="30" cy="120" r="1.5" fill="currentColor"/>
                    <line x1="30" y1="115" x2="30" y2="125" strokeWidth="1.5"/>
                    <line x1="25" y1="120" x2="35" y2="120" strokeWidth="1.5"/>
                    <circle cx="90" cy="35" r="1" fill="currentColor"/>
                    <line x1="90" y1="28" x2="90" y2="35" strokeWidth="1.5"/>
                    <circle cx="180" cy="210" r="1.5" fill="currentColor"/>
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
                onClick={() => setShowExportMenu(!showExportMenu)}
                className={`p-2.5 rounded-full transition-all transform hover:scale-110 active:scale-95 relative ${
                  theme === 'light'
                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                }`}
                title="Export chat"
              >
                📥
              </button>
              {showExportMenu && (
                <div className={`absolute top-16 right-20 rounded-lg shadow-lg p-2 z-40 ${
                  theme === 'light' ? 'bg-white border border-slate-200' : 'bg-slate-800 border border-slate-700'
                }`}>
                  <button onClick={() => exportChat('txt')} className={`block w-full text-left px-3 py-2 rounded text-sm ${theme === 'light' ? 'hover:bg-slate-100' : 'hover:bg-slate-700'}`}>📄 Export as Text</button>
                  <button onClick={() => exportChat('json')} className={`block w-full text-left px-3 py-2 rounded text-sm ${theme === 'light' ? 'hover:bg-slate-100' : 'hover:bg-slate-700'}`}>📋 Export as JSON</button>
                  <button onClick={() => exportChat('md')} className={`block w-full text-left px-3 py-2 rounded text-sm ${theme === 'light' ? 'hover:bg-slate-100' : 'hover:bg-slate-700'}`}>📝 Export as Markdown</button>
                </div>
              )}
              <button
                onClick={messages.length > 0 ? saveConversation : undefined}
                disabled={messages.length === 0}
                className={`p-2.5 rounded-full transition-all transform hover:scale-110 active:scale-95 ${
                  messages.length === 0
                    ? theme === 'light'
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-slate-900 text-slate-600 cursor-not-allowed'
                    : theme === 'light'
                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                }`}
                title="Save conversation"
              >
                💾
              </button>
              <button
                onClick={toggleTheme}
                className={`p-2.5 rounded-full transition-all transform hover:scale-110 active:scale-95 ${
                  theme === 'light'
                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
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

        {/* Search Bar */}
        {messages.length > 0 && (
          <div className={`px-5 py-3 border-b transition-all ${theme === 'light' ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-900/50'}`}>
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg text-sm focus:outline-none ${
                theme === 'light'
                  ? 'bg-white text-slate-900 placeholder-slate-400'
                  : 'bg-slate-800 text-white placeholder-slate-500'
              }`}
            />
          </div>
        )}

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
                  <svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="120" cy="120" r="105" strokeWidth="3.5"/>
                    <circle cx="120" cy="60" r="9" fill="currentColor"/>
                    <circle cx="165" cy="85" r="7" fill="currentColor"/>
                    <circle cx="190" cy="130" r="7" fill="currentColor"/>
                    <circle cx="165" cy="175" r="7" fill="currentColor"/>
                    <circle cx="120" cy="200" r="9" fill="currentColor"/>
                    <circle cx="75" cy="175" r="7" fill="currentColor"/>
                    <circle cx="50" cy="130" r="7" fill="currentColor"/>
                    <circle cx="75" cy="85" r="7" fill="currentColor"/>
                    <line x1="120" y1="60" x2="165" y2="85"/>
                    <line x1="165" y1="85" x2="190" y2="130"/>
                    <line x1="190" y1="130" x2="165" y2="175"/>
                    <line x1="165" y1="175" x2="120" y2="200"/>
                    <line x1="120" y1="200" x2="75" y2="175"/>
                    <line x1="75" y1="175" x2="50" y2="130"/>
                    <line x1="50" y1="130" x2="75" y2="85"/>
                    <line x1="75" y1="85" x2="120" y2="60"/>
                    <line x1="120" y1="60" x2="120" y2="120"/>
                    <line x1="165" y1="85" x2="120" y2="120"/>
                    <line x1="190" y1="130" x2="120" y2="120"/>
                    <line x1="165" y1="175" x2="120" y2="120"/>
                    <line x1="120" y1="200" x2="120" y2="120"/>
                    <line x1="75" y1="175" x2="120" y2="120"/>
                    <line x1="50" y1="130" x2="120" y2="120"/>
                    <line x1="75" y1="85" x2="120" y2="120"/>
                    <circle cx="120" cy="50" r="2" fill="currentColor"/>
                    <circle cx="150" cy="52" r="1.5" fill="currentColor"/>
                    <line x1="150" y1="45" x2="150" y2="52" strokeWidth="1.5"/>
                    <line x1="145" y1="48" x2="155" y2="48" strokeWidth="1.5"/>
                    <line x1="210" y1="115" x2="210" y2="125" strokeWidth="1.5"/>
                    <line x1="205" y1="120" x2="215" y2="120" strokeWidth="1.5"/>
                    <circle cx="210" cy="120" r="1.5" fill="currentColor"/>
                    <circle cx="218" cy="100" r="1" fill="currentColor"/>
                    <line x1="210" y1="188" x2="210" y2="195" strokeWidth="1.5"/>
                    <line x1="205" y1="192" x2="215" y2="192" strokeWidth="1.5"/>
                    <circle cx="30" cy="120" r="1.5" fill="currentColor"/>
                    <line x1="30" y1="115" x2="30" y2="125" strokeWidth="1.5"/>
                    <line x1="25" y1="120" x2="35" y2="120" strokeWidth="1.5"/>
                    <circle cx="90" cy="35" r="1" fill="currentColor"/>
                    <line x1="90" y1="28" x2="90" y2="35" strokeWidth="1.5"/>
                    <circle cx="180" cy="210" r="1.5" fill="currentColor"/>
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

      {/* Preferences Modal */}
      {showPreferences && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${
            theme === 'light' ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'
          }`}>
            {/* Modal Header */}
            <div className={`sticky top-0 flex items-center justify-between p-6 border-b ${
              theme === 'light' ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-800'
            }`}>
              <h2 className="text-2xl font-bold">⚙️ Preferences</h2>
              <button
                onClick={() => setShowPreferences(false)}
                className={`text-2xl font-bold transition-all hover:scale-110 ${
                  theme === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                }`}
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Display Settings */}
              <section className={`p-4 rounded-lg ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-800'}`}>
                <h3 className="text-lg font-bold mb-4 text-blue-500">📱 Display Settings</h3>
                
                {/* Font Size */}
                <div className="mb-5">
                  <label className="block text-sm font-semibold mb-2">Font Size</label>
                  <select
                    value={preferences.fontSize}
                    onChange={(e) => setPreferences({...preferences, fontSize: e.target.value})}
                    className={`w-full p-2 rounded-lg border transition-all ${
                      theme === 'light'
                        ? 'bg-white border-slate-300 text-slate-900 focus:border-blue-500'
                        : 'bg-slate-700 border-slate-600 text-white focus:border-blue-400'
                    }`}
                  >
                    <option value="sm">Small (14px)</option>
                    <option value="base">Normal (16px)</option>
                    <option value="lg">Large (18px)</option>
                    <option value="xl">Extra Large (20px)</option>
                  </select>
                </div>

                {/* Compact Mode */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-semibold">Compact Mode</p>
                    <p className="text-xs opacity-75">Reduce spacing for more messages</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.compactMode}
                    onChange={(e) => setPreferences({...preferences, compactMode: e.target.checked})}
                    className="w-5 h-5 cursor-pointer"
                  />
                </div>

                {/* Show Timestamps */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Show Timestamps</p>
                    <p className="text-xs opacity-75">Display message timestamps</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.showTimestamps}
                    onChange={(e) => setPreferences({...preferences, showTimestamps: e.target.checked})}
                    className="w-5 h-5 cursor-pointer"
                  />
                </div>
              </section>

              {/* Chat Behavior */}
              <section className={`p-4 rounded-lg ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-800'}`}>
                <h3 className="text-lg font-bold mb-4 text-blue-500">💬 Chat Behavior</h3>
                
                {/* Response Length */}
                <div className="mb-5">
                  <label className="block text-sm font-semibold mb-2">Response Length</label>
                  <select
                    value={preferences.responseLength}
                    onChange={(e) => setPreferences({...preferences, responseLength: e.target.value})}
                    className={`w-full p-2 rounded-lg border transition-all ${
                      theme === 'light'
                        ? 'bg-white border-slate-300 text-slate-900 focus:border-blue-500'
                        : 'bg-slate-700 border-slate-600 text-white focus:border-blue-400'
                    }`}
                  >
                    <option value="short">Short & Concise</option>
                    <option value="medium">Balanced</option>
                    <option value="long">Detailed & In-depth</option>
                  </select>
                </div>

                {/* Creativity Level */}
                <div className="mb-5">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-semibold">Creativity Level</label>
                    <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">{(preferences.creativityLevel * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={preferences.creativityLevel}
                    onChange={(e) => setPreferences({...preferences, creativityLevel: parseFloat(e.target.value)})}
                    className="w-full h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <p className="text-xs opacity-75 mt-1">0% = Precise | 100% = Creative</p>
                </div>

                {/* Message Animations */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Message Animations</p>
                    <p className="text-xs opacity-75">Smooth typing and fade-in effects</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.messageAnimations}
                    onChange={(e) => setPreferences({...preferences, messageAnimations: e.target.checked})}
                    className="w-5 h-5 cursor-pointer"
                  />
                </div>
              </section>

              {/* Notifications & Storage */}
              <section className={`p-4 rounded-lg ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-800'}`}>
                <h3 className="text-lg font-bold mb-4 text-blue-500">🔔 Notifications & Storage</h3>
                
                {/* Sound Notifications */}
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Sound Notifications</p>
                    <p className="text-xs opacity-75">Play sound when AI responds</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.soundNotifications}
                    onChange={(e) => setPreferences({...preferences, soundNotifications: e.target.checked})}
                    className="w-5 h-5 cursor-pointer"
                  />
                </div>

                {/* Auto Save */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Auto-save Conversations</p>
                    <p className="text-xs opacity-75">Automatically save chat history</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.autoSave}
                    onChange={(e) => setPreferences({...preferences, autoSave: e.target.checked})}
                    className="w-5 h-5 cursor-pointer"
                  />
                </div>
              </section>

              {/* Quick Info */}
              <section className={`p-4 rounded-lg border-l-4 border-blue-500 ${theme === 'light' ? 'bg-blue-50' : 'bg-slate-800'}`}>
                <h3 className="text-sm font-semibold mb-2">💡 Pro Tips</h3>
                <ul className="text-xs space-y-1 opacity-80">
                  <li>• Increase creativity for creative writing and brainstorming</li>
                  <li>• Set response length to short for quick answers</li>
                  <li>• Enable timestamps to track conversation flow</li>
                  <li>• Use compact mode for better overview of long chats</li>
                </ul>
              </section>

              {/* Reset Button */}
              <button
                onClick={() => {
                  setPreferences({
                    fontSize: 'base',
                    messageAnimations: true,
                    soundNotifications: false,
                    responseLength: 'medium',
                    creativityLevel: 0.7,
                    showTimestamps: false,
                    autoSave: true,
                    compactMode: false
                  });
                }}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-all ${
                  theme === 'light'
                    ? 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                    : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                }`}
              >
                Reset to Defaults
              </button>
            </div>
          </div>
        </div>
      )}

      {/* About Modal */}
      {showAbout && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${
            theme === 'light' ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'
          }`}>
            {/* Modal Header */}
            <div className={`sticky top-0 flex items-center justify-between p-6 border-b ${
              theme === 'light' ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-800'
            }`}>
              <h2 className="text-2xl font-bold">About Luntra</h2>
              <button
                onClick={() => setShowAbout(false)}
                className={`text-2xl font-bold transition-all hover:scale-110 ${
                  theme === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                }`}
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Project Overview */}
              <section>
                <h3 className="text-lg font-bold mb-3 text-blue-500">Project Overview</h3>
                <p className={`${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                  Luntra is a modern, feature-rich AI chatbot built with cutting-edge technology. It provides an intuitive interface for intelligent conversations powered by Google's Gemini API, delivering context-aware responses with real-time streaming capabilities.
                </p>
              </section>

              {/* Creator Information */}
              <section>
                <h3 className="text-lg font-bold mb-3 text-blue-500">Creator & Ownership</h3>
                <div className={`space-y-2 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                  <p><strong>Designed by:</strong> Abhinn ©</p>
                  <p><strong>Owned by:</strong> Abhinn</p>
                  <p><strong>Repository:</strong> github.com/abhi3405/luntra</p>
                  <p><strong>Version:</strong> 1.0.0</p>
                  <p><strong>Release Date:</strong> December 2025</p>
                </div>
              </section>

              {/* Copyright & License */}
              <section>
                <h3 className="text-lg font-bold mb-3 text-blue-500">Copyright & License</h3>
                <div className={`space-y-2 text-sm ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                  <p>© 2025 Abhinn. All rights reserved.</p>
                  <p>Luntra is licensed under the MIT License. You are free to use, modify, and distribute this software in accordance with the license terms.</p>
                  <p className="font-semibold mt-2">License Terms:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Permission is granted to use, copy, modify, and distribute the software</li>
                    <li>The software is provided "as is" without warranty</li>
                    <li>The copyright notice and license must be included in all copies</li>
                    <li>The authors are not liable for any damages or issues</li>
                  </ul>
                </div>
              </section>

              {/* Technology Stack */}
              <section>
                <h3 className="text-lg font-bold mb-3 text-blue-500">Technology Stack</h3>
                <div className={`grid grid-cols-2 gap-4 text-sm ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                  <div>
                    <p className="font-semibold mb-2">Frontend</p>
                    <ul className="space-y-1">
                      <li>• React 19</li>
                      <li>• TypeScript</li>
                      <li>• Tailwind CSS</li>
                      <li>• Vite</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold mb-2">Backend & AI</p>
                    <ul className="space-y-1">
                      <li>• Google Gemini API</li>
                      <li>• Real-time Streaming</li>
                      <li>• Web APIs</li>
                      <li>• localStorage</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Key Features */}
              <section>
                <h3 className="text-lg font-bold mb-3 text-blue-500">Key Features</h3>
                <div className={`space-y-2 text-sm ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                  <p>✓ <strong>Intelligent AI</strong> - Powered by Google Gemini for context-aware responses</p>
                  <p>✓ <strong>Real-time Streaming</strong> - Instant message delivery with smooth animations</p>
                  <p>✓ <strong>Conversation Management</strong> - Save and organize multiple conversations</p>
                  <p>✓ <strong>Search History</strong> - Quick access to previous searches</p>
                  <p>✓ <strong>Chat Export</strong> - Export conversations as TXT, JSON, or Markdown</p>
                  <p>✓ <strong>Customizable Preferences</strong> - Font size, response length, creativity level, animations</p>
                  <p>✓ <strong>Dark/Light Theme</strong> - Customizable UI with persistent preferences</p>
                  <p>✓ <strong>Responsive Design</strong> - Works seamlessly on all devices</p>
                  <p>✓ <strong>Data Persistence</strong> - All data saved locally for privacy</p>
                </div>
              </section>

              {/* Third-party Services */}
              <section>
                <h3 className="text-lg font-bold mb-3 text-blue-500">Third-party Services</h3>
                <div className={`space-y-2 text-sm ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                  <p><strong>Google Gemini API</strong></p>
                  <p className="ml-2">Used for AI-powered responses. Terms of Service: https://deepmind.google/terms/</p>
                  <p><strong>Google Fonts</strong></p>
                  <p className="ml-2">Roboto font family provided under Apache 2.0 License</p>
                </div>
              </section>

              {/* Data & Privacy */}
              <section>
                <h3 className="text-lg font-bold mb-3 text-blue-500">Data & Privacy</h3>
                <div className={`space-y-2 text-sm ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                  <p>• All conversations are stored locally in your browser using localStorage</p>
                  <p>• No data is transmitted to our servers (except API calls to Google Gemini)</p>
                  <p>• Messages sent to Gemini API are subject to Google's privacy policies</p>
                  <p>• Clearing browser data will remove all local conversations</p>
                  <p>• This application does not collect personal information</p>
                </div>
              </section>

              {/* Disclaimer */}
              <section className={`p-4 rounded-lg ${theme === 'light' ? 'bg-slate-100' : 'bg-slate-800'}`}>
                <h3 className="text-lg font-bold mb-2 text-orange-500">Disclaimer</h3>
                <p className={`text-sm ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                  Luntra is provided "AS IS" without any warranties or guarantees. The creators are not responsible for any damages, data loss, or issues arising from the use of this application. Use at your own risk. Always verify important information from official sources.
                </p>
              </section>

              {/* Contact & Support */}
              <section>
                <h3 className="text-lg font-bold mb-3 text-blue-500">Contact & Support</h3>
                <div className={`space-y-2 text-sm ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                  <p><strong>GitHub:</strong> github.com/abhi3405</p>
                  <p><strong>Issues & Feedback:</strong> Report on GitHub Issues</p>
                  <p><strong>Contributions:</strong> Pull requests are welcome</p>
                </div>
              </section>

              {/* Footer */}
              <div className={`text-center text-sm pt-4 border-t ${
                theme === 'light' ? 'border-slate-200 text-slate-600' : 'border-slate-800 text-slate-400'
              }`}>
                <p>Luntra © 2025 - Designed & Owned by Abhinn</p>
                <p>Made with ❤️ for better conversations</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;