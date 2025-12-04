import React, { useState, useRef, useEffect } from 'react';
import { Message, Role, ModelConfig } from './types';
import * as geminiService from './services/geminiService';
import MessageBubble from './components/MessageBubble';
import { SendIcon, MoonIcon, SunIcon, PlusIcon, HistoryIcon, SettingsIcon, ModelIcon } from './components/Icons';
import { useTheme } from './context/ThemeContext';

interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
  category: string;
}

function App() {
  const { theme, toggleTheme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showModal, setShowModal] = useState<'preferences' | 'about' | 'models' | 'templates' | null>(null);
  
  // Model Selection
  const [selectedModel, setSelectedModel] = useState<string>('gemini-pro');
  const models: ModelConfig[] = [
    { name: 'Gemini Pro', icon: '🤖', description: 'Most capable model for complex tasks', temperature: 0.7 },
    { name: 'Gemini Pro Vision', icon: '👁️', description: 'Advanced vision capabilities', temperature: 0.7 },
    { name: 'Fast Mode', icon: '⚡', description: 'Quick responses', temperature: 0.5 },
    { name: 'Creative Mode', icon: '✨', description: 'Creative and detailed responses', temperature: 0.9 },
  ];

  // Prompt Templates
  const [promptTemplates] = useState<PromptTemplate[]>([
    { id: '1', name: 'Code Review', description: 'Review my code', content: 'Please review the following code and provide suggestions:\n\n', category: 'development' },
    { id: '2', name: 'Writing Help', description: 'Help with writing', content: 'I need help improving this text:\n\n', category: 'writing' },
    { id: '3', name: 'Brainstorm', description: 'Brainstorm ideas', content: 'Help me brainstorm ideas for:\n\n', category: 'creativity' },
    { id: '4', name: 'Explain', description: 'Explain a concept', content: 'Please explain the following concept in simple terms:\n\n', category: 'learning' },
    { id: '5', name: 'Summarize', description: 'Summarize content', content: 'Please summarize this content:\n\n', category: 'productivity' },
    { id: '6', name: 'Translate', description: 'Translate text', content: 'Translate the following to English:\n\n', category: 'language' },
  ]);

  // State Management
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem('searchHistory');
    return saved ? JSON.parse(saved) : [];
  });

  const [conversations, setConversations] = useState<Array<{ id: string; title: string; timestamp: number; preview?: string }>>(() => {
    const saved = localStorage.getItem('conversations');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);

  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem('preferences');
    return saved ? JSON.parse(saved) : {
      fontSize: 'base',
      messageAnimations: true,
      soundNotifications: false,
      responseLength: 'medium',
      creativityLevel: 0.7,
      showTimestamps: true,
      autoSave: true,
      compactMode: false
    };
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Effects
  useEffect(() => {
    geminiService.initChatSession();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [inputValue]);

  useEffect(() => {
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
  }, [searchHistory]);

  useEffect(() => {
    localStorage.setItem('conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem('preferences', JSON.stringify(preferences));
  }, [preferences]);

  // Helper Functions
  const addToHistory = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setSearchHistory(prev => {
      const filtered = prev.filter(item => item !== trimmed);
      return [trimmed, ...filtered].slice(0, 20);
    });
  };

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
    if (messages.length > 0 && preferences.autoSave) {
      saveConversation();
    }
    geminiService.initChatSession();
    setMessages([]);
    setInputValue('');
    setIsTyping(false);
    setCurrentConversationId(null);
  };

  const saveConversation = () => {
    if (messages.length === 0) return;
    const firstMessage = messages[0]?.content || 'Untitled';
    const title = firstMessage.substring(0, 50) + (firstMessage.length > 50 ? '...' : '');
    const preview = messages[messages.length - 1]?.content.substring(0, 100) || '';
    const id = Date.now().toString();
    setConversations(prev => [{ id, title, timestamp: Date.now(), preview }, ...prev]);
    setCurrentConversationId(id);
  };

  const deleteConversation = (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (currentConversationId === id) {
      setCurrentConversationId(null);
      setMessages([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const exportChat = (format: 'txt' | 'json' | 'md') => {
    let content = '';
    const title = `Chat Export - ${new Date().toLocaleDateString()}`;

    if (format === 'txt') {
      content = `${title}\n${'='.repeat(50)}\n\n`;
      messages.forEach(msg => {
        content += `${msg.role === Role.USER ? '👤 You' : '🤖 Assistant'}: ${msg.content}\n\n`;
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
    element.setAttribute('download', `luntra-export.${format}`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setShowExportMenu(false);
  };

  // Modal Components
  const PreferencesModal = () => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className={`rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${
        theme === 'light' ? 'bg-white text-slate-900' : 'bg-slate-900/95 text-white border border-slate-800'
      }`}>
        <div className={`sticky top-0 flex items-center justify-between p-6 border-b ${
          theme === 'light' ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-800/50'
        }`}>
          <h2 className="text-2xl font-bold">⚙️ Preferences</h2>
          <button onClick={() => setShowModal(null)} className="text-2xl hover:scale-110 transition-transform">×</button>
        </div>

        <div className="p-6 space-y-6">
          <section className={`p-4 rounded-2xl ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-800/50'}`}>
            <h3 className="text-lg font-bold mb-4 text-blue-500">📱 Display</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Font Size</label>
                <select value={preferences.fontSize} onChange={(e) => setPreferences({...preferences, fontSize: e.target.value})} className={`w-full p-2 rounded-lg border transition-all ${theme === 'light' ? 'bg-white border-slate-300' : 'bg-slate-700 border-slate-600'}`}>
                  <option value="sm">Small</option>
                  <option value="base">Normal</option>
                  <option value="lg">Large</option>
                  <option value="xl">Extra Large</option>
                </select>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={preferences.compactMode} onChange={(e) => setPreferences({...preferences, compactMode: e.target.checked})} />
                <span>Compact Mode</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={preferences.showTimestamps} onChange={(e) => setPreferences({...preferences, showTimestamps: e.target.checked})} />
                <span>Show Timestamps</span>
              </label>
            </div>
          </section>

          <section className={`p-4 rounded-2xl ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-800/50'}`}>
            <h3 className="text-lg font-bold mb-4 text-blue-500">💬 Chat Behavior</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Response Length</label>
                <select value={preferences.responseLength} onChange={(e) => setPreferences({...preferences, responseLength: e.target.value})} className={`w-full p-2 rounded-lg border transition-all ${theme === 'light' ? 'bg-white border-slate-300' : 'bg-slate-700 border-slate-600'}`}>
                  <option value="short">Short</option>
                  <option value="medium">Balanced</option>
                  <option value="long">Detailed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Creativity ({(preferences.creativityLevel * 100).toFixed(0)}%)</label>
                <input type="range" min="0" max="1" step="0.1" value={preferences.creativityLevel} onChange={(e) => setPreferences({...preferences, creativityLevel: parseFloat(e.target.value)})} className="w-full" />
              </div>
            </div>
          </section>

          <button onClick={() => setPreferences({
            fontSize: 'base', messageAnimations: true, soundNotifications: false,
            responseLength: 'medium', creativityLevel: 0.7, showTimestamps: true,
            autoSave: true, compactMode: false
          })} className={`w-full py-2 rounded-lg font-medium ${theme === 'light' ? 'bg-slate-200 hover:bg-slate-300' : 'bg-slate-700 hover:bg-slate-600'}`}>
            Reset Defaults
          </button>
        </div>
      </div>
    </div>
  );

  const ModelsModal = () => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className={`rounded-3xl shadow-2xl max-w-2xl w-full ${
        theme === 'light' ? 'bg-white text-slate-900' : 'bg-slate-900/95 text-white border border-slate-800'
      }`}>
        <div className={`flex items-center justify-between p-6 border-b ${
          theme === 'light' ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-800/50'
        }`}>
          <h2 className="text-2xl font-bold">🤖 AI Models</h2>
          <button onClick={() => setShowModal(null)} className="text-2xl hover:scale-110 transition-transform">×</button>
        </div>

        <div className="p-6 space-y-3 max-h-[70vh] overflow-y-auto">
          {models.map((model) => (
            <button key={model.name} onClick={() => { setSelectedModel(model.name.toLowerCase()); setShowModal(null); }} className={`w-full p-4 rounded-2xl text-left transition-all ${
              selectedModel === model.name.toLowerCase()
                ? theme === 'light' ? 'bg-blue-100 border-2 border-blue-500' : 'bg-blue-900/40 border-2 border-blue-500'
                : theme === 'light' ? 'bg-slate-100 hover:bg-slate-200' : 'bg-slate-800/50 hover:bg-slate-700/50'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold">{model.icon} {model.name}</p>
                  <p className="text-sm opacity-75">{model.description}</p>
                </div>
                {selectedModel === model.name.toLowerCase() && <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">✓</div>}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const TemplatesModal = () => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className={`rounded-3xl shadow-2xl max-w-2xl w-full ${
        theme === 'light' ? 'bg-white text-slate-900' : 'bg-slate-900/95 text-white border border-slate-800'
      }`}>
        <div className={`flex items-center justify-between p-6 border-b ${
          theme === 'light' ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-800/50'
        }`}>
          <h2 className="text-2xl font-bold">✨ Prompt Templates</h2>
          <button onClick={() => setShowModal(null)} className="text-2xl hover:scale-110 transition-transform">×</button>
        </div>

        <div className="p-6 space-y-3 max-h-[70vh] overflow-y-auto">
          {promptTemplates.map((template) => (
            <button key={template.id} onClick={() => { setInputValue(template.content); setShowModal(null); }} className={`w-full p-4 rounded-2xl text-left transition-all ${
              theme === 'light' ? 'bg-slate-100 hover:bg-slate-200' : 'bg-slate-800/50 hover:bg-slate-700/50'
            }`}>
              <p className="font-bold">{template.name}</p>
              <p className="text-sm opacity-75">{template.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const AboutModal = () => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className={`rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${
        theme === 'light' ? 'bg-white text-slate-900' : 'bg-slate-900/95 text-white border border-slate-800'
      }`}>
        <div className={`sticky top-0 flex items-center justify-between p-6 border-b ${
          theme === 'light' ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-800/50'
        }`}>
          <h2 className="text-2xl font-bold">About Luntra</h2>
          <button onClick={() => setShowModal(null)} className="text-2xl hover:scale-110 transition-transform">×</button>
        </div>

        <div className="p-6 space-y-6 text-sm">
          <section>
            <h3 className="text-lg font-bold mb-2 text-blue-500">About This Project</h3>
            <p>Luntra is a modern, feature-rich AI chatbot powered by Google's Gemini API. Built with React, TypeScript, and Tailwind CSS for an elegant Spotify-like user experience.</p>
          </section>

          <section>
            <h3 className="text-lg font-bold mb-2 text-blue-500">Creator & Ownership</h3>
            <p><strong>Designed by:</strong> Abhinn ©</p>
            <p><strong>GitHub:</strong> github.com/abhi3405/Luntra-by-Abhinn</p>
            <p><strong>Version:</strong> 2.0.0</p>
            <p><strong>Release:</strong> December 2025</p>
          </section>

          <section>
            <h3 className="text-lg font-bold mb-2 text-blue-500">Key Features</h3>
            <ul className="space-y-1 list-disc list-inside">
              <li>Real-time streaming responses</li>
              <li>Conversation management & export</li>
              <li>Customizable preferences</li>
              <li>Dark/Light theme support</li>
              <li>Prompt templates library</li>
              <li>Model selection</li>
              <li>Message bookmarking & reactions</li>
              <li>Search history tracking</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-bold mb-2 text-blue-500">Technology</h3>
            <p><strong>Frontend:</strong> React 19, TypeScript, Tailwind CSS, Vite</p>
            <p><strong>AI:</strong> Google Gemini API</p>
            <p><strong>Storage:</strong> localStorage</p>
          </section>

          <section>
            <h3 className="text-lg font-bold mb-2 text-orange-500">License</h3>
            <p>© 2025 Abhinn. Licensed under MIT License.</p>
            <p className="text-xs opacity-75 mt-2">Luntra is provided "AS IS" without warranties. Use at your own risk.</p>
          </section>
        </div>
      </div>
    </div>
  );

  // Main Render
  return (
    <div className={`flex h-screen overflow-hidden transition-all duration-500 ${
      theme === 'light'
        ? 'bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900'
        : 'bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white'
    }`}>
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-72' : 'w-0'} transition-all duration-300 overflow-hidden flex flex-col ${
        theme === 'light'
          ? 'bg-white border-r border-slate-200 shadow-lg'
          : 'bg-slate-900/50 border-r border-slate-800 backdrop-blur-xl'
      }`}>
        {/* Logo & New Chat */}
        <div className={`p-6 border-b ${theme === 'light' ? 'border-slate-200' : 'border-slate-800'}`}>
          <h1 className="text-3xl font-black bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent mb-4">Luntra</h1>
          <button onClick={handleNewChat} className={`w-full px-4 py-2.5 rounded-xl font-semibold transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 ${
            theme === 'light'
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg'
              : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-lg hover:shadow-blue-500/20'
          }`}>
            <PlusIcon size={18} />
            New Chat
          </button>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {conversations.length > 0 && (
            <>
              <h3 className={`text-xs font-bold uppercase tracking-wider ${
                theme === 'light' ? 'text-slate-500' : 'text-slate-400'
              }`}>Conversations</h3>
              {conversations.slice(0, 10).map((conv) => (
                <button key={conv.id} onClick={() => setCurrentConversationId(conv.id)} className={`w-full text-left px-3 py-2.5 rounded-xl transition-all group ${
                  currentConversationId === conv.id
                    ? theme === 'light'
                      ? 'bg-blue-100 text-blue-900'
                      : 'bg-blue-900/30 text-blue-300'
                    : theme === 'light'
                    ? 'text-slate-700 hover:bg-slate-100'
                    : 'text-slate-300 hover:bg-slate-800/50'
                }`}>
                  <p className="font-medium truncate text-sm">{conv.title}</p>
                  <p className="text-xs opacity-60 truncate">{conv.preview}</p>
                </button>
              ))}
            </>
          )}
          {searchHistory.length > 0 && (
            <>
              <h3 className={`text-xs font-bold uppercase tracking-wider mt-4 ${
                theme === 'light' ? 'text-slate-500' : 'text-slate-400'
              }`}>History</h3>
              {searchHistory.slice(0, 5).map((item, idx) => (
                <button key={idx} onClick={() => setInputValue(item)} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all truncate ${
                  theme === 'light'
                    ? 'text-slate-700 hover:bg-slate-100'
                    : 'text-slate-400 hover:bg-slate-800/50'
                }`} title={item}>
                  {item}
                </button>
              ))}
            </>
          )}
        </div>

        {/* Settings */}
        <div className={`p-4 border-t space-y-2 ${theme === 'light' ? 'border-slate-200' : 'border-slate-800'}`}>
          <button onClick={() => setShowModal('models')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
            theme === 'light'
              ? 'text-slate-700 hover:bg-slate-100'
              : 'text-slate-300 hover:bg-slate-800/50'
          }`}>
            <ModelIcon size={16} />
            Models
          </button>
          <button onClick={() => setShowModal('templates')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
            theme === 'light'
              ? 'text-slate-700 hover:bg-slate-100'
              : 'text-slate-300 hover:bg-slate-800/50'
          }`}>
            ✨ Templates
          </button>
          <button onClick={() => setShowModal('preferences')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
            theme === 'light'
              ? 'text-slate-700 hover:bg-slate-100'
              : 'text-slate-300 hover:bg-slate-800/50'
          }`}>
            <SettingsIcon size={16} />
            Settings
          </button>
          <button onClick={toggleTheme} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
            theme === 'light'
              ? 'text-slate-700 hover:bg-slate-100'
              : 'text-slate-300 hover:bg-slate-800/50'
          }`}>
            {theme === 'light' ? <MoonIcon size={16} /> : <SunIcon size={16} />}
            {theme === 'light' ? 'Dark' : 'Light'}
          </button>
          <button onClick={() => setShowModal('about')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
            theme === 'light'
              ? 'text-slate-700 hover:bg-slate-100'
              : 'text-slate-300 hover:bg-slate-800/50'
          }`}>
            ℹ️ About
          </button>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 backdrop-blur-xl border-b ${
          theme === 'light'
            ? 'bg-white/80 border-slate-200'
            : 'bg-slate-900/50 border-slate-800'
        }`}>
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className={`p-2 rounded-lg transition-all ${
              theme === 'light'
                ? 'bg-slate-100 hover:bg-slate-200'
                : 'bg-slate-800 hover:bg-slate-700'
            }`}>
              {sidebarOpen ? '◀' : '▶'}
            </button>
            <h2 className="text-lg font-bold">Luntra Chat</h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowExportMenu(!showExportMenu)} className={`p-2 rounded-lg transition-all relative ${
              theme === 'light'
                ? 'bg-slate-100 hover:bg-slate-200'
                : 'bg-slate-800 hover:bg-slate-700'
            }`} title="Export">
              📥
            </button>
            {showExportMenu && (
              <div className={`absolute top-16 right-8 rounded-xl shadow-xl p-2 z-40 ${
                theme === 'light' ? 'bg-white border border-slate-200' : 'bg-slate-800 border border-slate-700'
              }`}>
                <button onClick={() => exportChat('txt')} className={`block w-full text-left px-3 py-2 rounded text-sm ${theme === 'light' ? 'hover:bg-slate-100' : 'hover:bg-slate-700'}`}>📄 Text</button>
                <button onClick={() => exportChat('json')} className={`block w-full text-left px-3 py-2 rounded text-sm ${theme === 'light' ? 'hover:bg-slate-100' : 'hover:bg-slate-700'}`}>📋 JSON</button>
                <button onClick={() => exportChat('md')} className={`block w-full text-left px-3 py-2 rounded text-sm ${theme === 'light' ? 'hover:bg-slate-100' : 'hover:bg-slate-700'}`}>📝 Markdown</button>
              </div>
            )}
            <button onClick={messages.length > 0 ? saveConversation : undefined} disabled={messages.length === 0} className={`p-2 rounded-lg transition-all ${
              messages.length === 0
                ? theme === 'light'
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                : theme === 'light'
                ? 'bg-slate-100 hover:bg-slate-200'
                : 'bg-slate-800 hover:bg-slate-700'
            }`} title="Save">
              💾
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center">
              <div className={`w-24 h-24 rounded-3xl mb-8 flex items-center justify-center bg-gradient-to-br ${
                theme === 'light'
                  ? 'from-blue-100 to-blue-50'
                  : 'from-blue-900/30 to-purple-900/30'
              }`}>
                <span className="text-5xl">🚀</span>
              </div>
              <h2 className="text-4xl font-bold mb-2">How can I help?</h2>
              <p className={`text-base max-w-md ${
                theme === 'light' ? 'text-slate-600' : 'text-slate-400'
              }`}>
                Start a conversation or use a prompt template to get started.
              </p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto p-6 space-y-4">
              {messages.map(msg => (
                <MessageBubble key={msg.id} message={msg} theme={theme} />
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className={`rounded-2xl px-4 py-3 flex items-center gap-2 ${
                    theme === 'light' ? 'bg-slate-100' : 'bg-slate-800/50'
                  }`}>
                    <div className={`w-2 h-2 rounded-full animate-bounce ${theme === 'light' ? 'bg-slate-600' : 'bg-slate-300'}`}></div>
                    <div className={`w-2 h-2 rounded-full animate-bounce ${theme === 'light' ? 'bg-slate-600' : 'bg-slate-300'}`} style={{animationDelay: '0.1s'}}></div>
                    <div className={`w-2 h-2 rounded-full animate-bounce ${theme === 'light' ? 'bg-slate-600' : 'bg-slate-300'}`} style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className={`p-6 border-t backdrop-blur-xl ${
          theme === 'light'
            ? 'bg-white/80 border-slate-200'
            : 'bg-slate-900/50 border-slate-800'
        }`}>
          <div className="max-w-4xl mx-auto">
            <div className={`relative rounded-2xl transition-all ${
              theme === 'light'
                ? 'bg-slate-100'
                : 'bg-slate-800/50'
            }`}>
              <textarea
                ref={textareaRef}
                rows={1}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                className={`w-full rounded-2xl px-6 py-4 resize-none overflow-hidden max-h-[120px] text-sm bg-transparent focus:outline-none ${
                  theme === 'light'
                    ? 'text-slate-900 placeholder-slate-500'
                    : 'text-white placeholder-slate-500'
                }`}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className={`absolute right-3 bottom-3 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  !inputValue.trim() || isTyping
                    ? theme === 'light'
                      ? 'bg-slate-200 text-slate-400'
                      : 'bg-slate-700 text-slate-600'
                    : theme === 'light'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg'
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-lg hover:shadow-blue-500/20'
                }`}
              >
                <SendIcon size={18} />
              </button>
            </div>
            <p className={`text-xs text-center mt-2 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
              Designed by Abhinn © 2025
            </p>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showModal === 'preferences' && <PreferencesModal />}
      {showModal === 'models' && <ModelsModal />}
      {showModal === 'templates' && <TemplatesModal />}
      {showModal === 'about' && <AboutModal />}
    </div>
  );
}

export default App;
