export type MessageType = 'text' | 'error' | 'file';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  type: MessageType;
  timestamp: Date;
  agent?: string;
  metadata?: Record<string, any>;
}
