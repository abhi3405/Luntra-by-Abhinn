export enum Role {
  USER = 'user',
  MODEL = 'model'
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  isStreaming?: boolean;
  timestamp: number;
  bookmarked?: boolean;
  edited?: boolean;
  reactions?: string[];
  images?: string[]; // URLs of generated images
  imagePrompt?: string; // Original prompt for image generation
}

export interface ChatSessionState {
  messages: Message[];
  isTyping: boolean;
  error?: string;
}

export interface Conversation {
  id: string;
  title: string;
  timestamp: number;
  preview?: string;
  messageCount?: number;
}

export interface ModelConfig {
  name: string;
  icon: string;
  description: string;
  temperature: number;
}

// Icons
export interface IconProps {
  className?: string;
  size?: number;
}
