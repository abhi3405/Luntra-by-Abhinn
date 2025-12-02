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
}

export interface ChatSessionState {
  messages: Message[];
  isTyping: boolean;
  error?: string;
}

// Icons
export interface IconProps {
  className?: string;
  size?: number;
}
