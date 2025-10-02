import { useState, useCallback, useRef } from 'react';
import { Message, MessageType } from '../types/chat';
import { AgentInfo } from '../types/agents';
import { GCPArchitecture } from '../types/gcp';
import { apiClient } from '../services/api';

export const useAgentSystem = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [architecture, setArchitecture] = useState<GCPArchitecture | null>(null);
  const [agentStatus, setAgentStatus] = useState<AgentInfo[]>([
    {
      id: 'requirements-analysis',
      name: 'Requirements Analysis Agent',
      description: 'Analyzes project requirements and constraints',
      status: 'idle',
      capabilities: ['requirement extraction', 'constraint analysis', 'business logic understanding'],
      currentTask: null,
      lastActivity: null,
      metrics: { tasksCompleted: 0, avgResponseTime: 0, successRate: 0 },
      recentActivities: []
    },
    {
      id: 'cloud-architecture',
      name: 'Cloud Architecture Agent',
      description: 'Designs optimal GCP architectures',
      status: 'idle',
      capabilities: ['service selection', 'architecture design', 'cost optimization'],
      currentTask: null,
      lastActivity: null,
      metrics: { tasksCompleted: 0, avgResponseTime: 0, successRate: 0 },
      recentActivities: []
    },
    {
      id: 'iac-generation',
      name: 'IaC Generation Agent',
      description: 'Generates Terraform configurations',
      status: 'idle',
      capabilities: ['terraform generation', 'IaC best practices', 'resource management'],
      currentTask: null,
      lastActivity: null,
      metrics: { tasksCompleted: 0, avgResponseTime: 0, successRate: 0 },
      recentActivities: []
    },
    {
      id: 'deployment',
      name: 'Deployment Agent',
      description: 'Handles infrastructure provisioning and deployment',
      status: 'idle',
      capabilities: ['terraform apply', 'deployment orchestration', 'resource verification'],
      currentTask: null,
      lastActivity: null,
      metrics: { tasksCompleted: 0, avgResponseTime: 0, successRate: 0 },
      recentActivities: []
    }
  ]);
  const [deploymentStatus, setDeploymentStatus] = useState<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const updateAgentStatus = useCallback((agentId: string, updates: Partial<AgentInfo>) => {
    setAgentStatus(prev => prev.map(agent =>
      agent.id === agentId
        ? { ...agent, ...updates, lastActivity: new Date().toISOString() }
        : agent
    ));
  }, []);

  const addMessage = useCallback((message: Omit<Message, 'timestamp'>) => {
    setMessages(prev => [...prev, { ...message, timestamp: new Date() }]);
  }, []);

  const sendMessage = useCallback(async (content: string, type: MessageType = 'text') => {
    // Add user message
    addMessage({
      role: 'user',
      content,
      type
    });

    setIsProcessing(true);

    try {
      let assistantMessage = '';
      let currentAgent: string | null = null;

      // Stream response from backend using our API client
      for await (const event of apiClient.streamChat(content, messages)) {
        if (event.type === 'agent_status') {
          // Update agent status
          updateAgentStatus(event.agent_id, {
            status: event.status,
            currentTask: event.current_task || null,
            recentActivities: event.activity ? [
              ...(agentStatus.find(a => a.id === event.agent_id)?.recentActivities || []).slice(-4),
              event.activity
            ] : (agentStatus.find(a => a.id === event.agent_id)?.recentActivities || [])
          });
          currentAgent = event.agent_id;
        } else if (event.type === 'text') {
          assistantMessage += event.content;
          currentAgent = event.agent || currentAgent;

          // Update the current message with streaming content
          setMessages(prev => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage?.role === 'assistant') {
              return [
                ...prev.slice(0, -1),
                { ...lastMessage, content: assistantMessage }
              ];
            } else {
              return [
                ...prev,
                {
                  role: 'assistant',
                  content: assistantMessage,
                  type: 'text',
                  timestamp: new Date(),
                  agent: currentAgent || undefined
                }
              ];
            }
          });
        } else if (event.type === 'architecture') {
          setArchitecture(event.data);
        } else if (event.type === 'deployment_status') {
          setDeploymentStatus(event.data);
        } else if (event.type === 'error') {
          addMessage({
            role: 'assistant',
            content: `Error: ${event.message}`,
            type: 'error'
          });
        }
      }

    } catch (error: any) {
      console.error('Error sending message:', error);
      addMessage({
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        type: 'error'
      });
    } finally {
      setIsProcessing(false);

      // Reset all agents to idle
      setAgentStatus(prev => prev.map(agent => ({
        ...agent,
        status: 'idle',
        currentTask: null
      })));
    }
  }, [messages, addMessage, updateAgentStatus, agentStatus]);

  const uploadProject = useCallback(async (files: File[], description?: string) => {
    addMessage({
      role: 'user',
      content: `Uploaded ${files.length} files${description ? `: ${description}` : ''}`,
      type: 'file',
      metadata: {
        fileCount: files.length,
        files: files.map(f => ({ name: f.name, size: f.size }))
      }
    });

    // For now, just acknowledge - can implement upload endpoint later
    addMessage({
      role: 'assistant',
      content: 'File upload functionality coming soon. For now, please describe your application requirements in text.',
      type: 'text'
    });
  }, [addMessage]);

  return {
    messages,
    isProcessing,
    agentStatus,
    architecture,
    deploymentStatus,
    sendMessage,
    uploadProject
  };
};
