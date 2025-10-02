import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Zap, Bot, User } from 'lucide-react';
import { Message, MessageType } from '../types/chat';

interface ChatInterfaceProps {
  messages: Message[];
  isProcessing: boolean;
  onSendMessage: (content: string, type?: MessageType) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  isProcessing,
  onSendMessage
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;
    
    onSendMessage(input.trim());
    setInput('');
  };

  const getMessageIcon = (role: string) => {
    switch (role) {
      case 'user':
        return <User className="w-4 h-4" />;
      case 'assistant':
        return <Bot className="w-4 h-4" />;
      case 'agent':
        return <Zap className="w-4 h-4" />;
      default:
        return <Bot className="w-4 h-4" />;
    }
  };

  const getMessageBg = (role: string) => {
    switch (role) {
      case 'user':
        return 'bg-blue-50 border-blue-200';
      case 'assistant':
        return 'bg-white border-gray-200';
      case 'agent':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Welcome to GCP Vibe
            </h3>
            <p className="text-gray-600 max-w-md">
              I'm your agentic cloud architect. I can help you deploy applications to GCP using natural language. 
              Tell me about your project or upload your code to get started.
            </p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
              <button
                onClick={() => onSendMessage("Help me deploy a React app to GCP")}
                className="p-4 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <div className="font-medium text-gray-900">Deploy React App</div>
                <div className="text-sm text-gray-600">Set up hosting for a React application</div>
              </button>
              <button
                onClick={() => onSendMessage("I need a database and API for my Python app")}
                className="p-4 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <div className="font-medium text-gray-900">Python API + Database</div>
                <div className="text-sm text-gray-600">Set up backend infrastructure</div>
              </button>
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex space-x-4 p-4 rounded-lg border ${getMessageBg(message.role)}`}
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center">
              {getMessageIcon(message.role)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm font-medium capitalize text-gray-900">
                  {message.role === 'assistant' ? 'GCP Vibe' : message.role}
                </span>
                {message.agent && (
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                    {message.agent}
                  </span>
                )}
                <span className="text-xs text-gray-500">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <div className="prose prose-sm max-w-none text-gray-800">
                {message.content}
              </div>
              {message.metadata && (
                <div className="mt-3 text-xs text-gray-500">
                  {Object.entries(message.metadata).map(([key, value]) => (
                    <div key={key}>
                      <span className="font-medium">{key}:</span> {String(value)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isProcessing && (
          <div className="flex space-x-4 p-4 rounded-lg border bg-gray-50 border-gray-200">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-600">
                Agents are analyzing your request...
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white p-4">
        <form onSubmit={handleSubmit} className="flex space-x-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your GCP deployment needs..."
              disabled={isProcessing}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <Paperclip className="w-5 h-5" />
            </button>
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isProcessing}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};