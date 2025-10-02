import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Settings, Upload, Play, Pause, RefreshCw } from 'lucide-react';
import { ChatInterface } from './ChatInterface';
import { ArchitectureDashboard } from './ArchitectureDashboard';
import { AgentStatus } from './AgentStatus';
import { ProjectUpload } from './ProjectUpload';
import { useAgentSystem } from '../hooks/useAgentSystem';

export const ChatDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'dashboard' | 'agents'>('chat');
  const { 
    messages, 
    isProcessing, 
    agentStatus, 
    architecture, 
    sendMessage, 
    uploadProject,
    deploymentStatus 
  } = useAgentSystem();

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AV</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">GCP Vibe</h1>
              <span className="text-sm text-gray-500">Agentic Cloud Architect</span>
            </div>
            
            {isProcessing && (
              <div className="flex items-center space-x-2 text-blue-600">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="text-sm">Agents working...</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <ProjectUpload onUpload={uploadProject} />
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-8 mt-4">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md ${
              activeTab === 'chat'
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Chat</span>
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md ${
              activeTab === 'dashboard'
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Play className="w-4 h-4" />
            <span>Architecture Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab('agents')}
            className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md ${
              activeTab === 'agents'
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            <span>Agent Status</span>
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'chat' && (
          <ChatInterface 
            messages={messages}
            isProcessing={isProcessing}
            onSendMessage={sendMessage}
          />
        )}
        {activeTab === 'dashboard' && (
          <ArchitectureDashboard 
            architecture={architecture}
            deploymentStatus={deploymentStatus}
          />
        )}
        {activeTab === 'agents' && (
          <AgentStatus 
            agentStatus={agentStatus}
          />
        )}
      </div>
    </div>
  );
};