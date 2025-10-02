import React from 'react';
import { Bot, CheckCircle, Clock, AlertCircle, Activity } from 'lucide-react';
import { AgentInfo } from '../types/agents';

interface AgentStatusProps {
  agentStatus: AgentInfo[];
}

export const AgentStatus: React.FC<AgentStatusProps> = ({ agentStatus }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'working':
        return <Activity className="w-5 h-5 text-blue-500 animate-pulse" />;
      case 'idle':
        return <Clock className="w-5 h-5 text-gray-400" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-50 border-green-200';
      case 'working':
        return 'bg-blue-50 border-blue-200';
      case 'idle':
        return 'bg-gray-50 border-gray-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="h-full p-6 bg-gray-50">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Agent System Status</h2>
        <p className="text-gray-600">Monitor the status and activity of all specialized agents</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {agentStatus.map((agent) => (
          <div
            key={agent.id}
            className={`bg-white rounded-lg border-2 p-6 ${getStatusColor(agent.status)}`}
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  agent.id === 'deep-research' 
                    ? 'bg-gradient-to-r from-green-500 to-teal-600' 
                    : 'bg-gradient-to-r from-blue-500 to-purple-600'
                }`}>
                  <Bot className="w-6 h-6 text-white" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{agent.name}</h3>
                  {getStatusIcon(agent.status)}
                </div>
                
                <p className="text-gray-600 text-sm mb-4">{agent.description}</p>

                <div className="space-y-3">
                  {/* Current Task */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Current Task</h4>
                    <p className="text-sm text-gray-600">
                      {agent.currentTask || 'No active task'}
                    </p>
                  </div>

                  {/* Capabilities */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Capabilities</h4>
                    <div className="flex flex-wrap gap-1">
                      {agent.capabilities.map((capability, index) => (
                        <span
                          key={index}
                          className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full"
                        >
                          {capability}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Performance</h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-lg font-semibold text-gray-900">
                          {agent.metrics?.tasksCompleted || 0}
                        </p>
                        <p className="text-xs text-gray-500">Tasks</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-gray-900">
                          {agent.metrics?.avgResponseTime || 0}s
                        </p>
                        <p className="text-xs text-gray-500">Avg Time</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-gray-900">
                          {agent.metrics?.successRate || 0}%
                        </p>
                        <p className="text-xs text-gray-500">Success</p>
                      </div>
                    </div>
                  </div>

                  {/* Last Activity */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Last Activity</h4>
                    <p className="text-sm text-gray-600">
                      {agent.lastActivity ? new Date(agent.lastActivity).toLocaleString() : 'Never'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity Log */}
            {agent.recentActivities && agent.recentActivities.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Activities</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {agent.recentActivities.map((activity, index) => (
                    <div key={index} className="text-xs text-gray-600 flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0" />
                      <span className="truncate">{activity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Agent Communication Graph */}
      <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Agent Communication</h3>
        <div className="flex items-center justify-center h-48 text-gray-500">
          <div className="text-center">
            <Bot className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Agent communication visualization coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
};