# Luntra AI - Modern Chat Interface

A beautifully designed, feature-rich AI chatbot built with React, TypeScript, and Tailwind CSS. Powered by Google's Gemini API for intelligent, context-aware responses.

## ✨ Key Features

### 🎨 Modern UI Design
- **Spotify-inspired Dark Theme** - Elegant gradient accents and glassmorphism effects
- **Card-based Interface** - Clean, organized message display with smooth animations
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Dark/Light Mode** - Toggle between themes with persistent preferences

### 💬 Chat Features
- **Real-time Streaming** - Watch responses appear as they're generated
- **Conversation Management** - Save, load, and organize multiple conversations
- **Smart Search** - Search through messages and conversation history
- **Export Options** - Export chats as TXT, JSON, or Markdown

### 🤖 AI Capabilities
- **Model Selection** - Choose between multiple AI models:
  - Gemini Pro (Default)
  - Gemini Pro Vision
  - Fast Mode
  - Creative Mode
- **Adjustable Parameters** - Control response length and creativity level
- **Prompt Templates** - Quick-start prompts for common tasks

### ⚙️ Professional Features
- **Message Actions** - Copy, bookmark, regenerate, and delete messages
- **Typing Indicators** - Visual feedback when AI is composing
- **Timestamps** - Track when messages were sent
- **Auto-save** - Automatically save conversations
- **History Tracking** - Search history management

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Google Gemini API key

### Installation

```bash
# Clone the repository
git clone https://github.com/abhi3405/Luntra-by-Abhinn.git
cd Luntra-by-Abhinn

# Install dependencies
npm install

# Create .env.local file and add your API key
echo "VITE_GEMINI_API_KEY=your_api_key_here" > .env.local

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🛠️ Technology Stack

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling and design system
- **Vite** - Build tool and dev server

### Backend & AI
- **Google Gemini API** - AI responses
- **Real-time Streaming** - Progressive response generation
- **localStorage** - Client-side data persistence

## 📂 Project Structure

```
luntra-ai/
├── components/           # React components
│   ├── MessageBubble.tsx # Message display with actions
│   ├── MarkdownRenderer.tsx
│   ├── Icons.tsx        # Icon components
│   └── Sidebar.tsx
├── context/             # React context
│   └── ThemeContext.tsx # Theme provider
├── services/            # External services
│   └── geminiService.ts # Gemini API integration
├── App.tsx              # Main application
├── types.ts             # TypeScript types
├── index.tsx            # Entry point
└── index.html           # HTML template
```

## 🔐 Privacy & Data

- All conversations are stored locally in your browser
- No data is sent to external servers (except Google Gemini API)
- Messages to Gemini API are subject to Google's privacy policies
- Clearing browser data will remove all local conversations

## 📝 License

© 2025 Abhinn. Licensed under the MIT License.

This project is provided "AS IS" without any warranties or guarantees.

## 👨‍💻 Creator

**Designed and Owned by:** Abhinn

**GitHub:** [@abhi3405](https://github.com/abhi3405)

**Repository:** [github.com/abhi3405/Luntra-by-Abhinn](https://github.com/abhi3405/Luntra-by-Abhinn)

---

**Made with ❤️ by Abhinn © 2025**
