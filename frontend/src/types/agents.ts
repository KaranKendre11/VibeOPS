export interface AgentMetrics {
  tasksCompleted: number;
  avgResponseTime: number;
  successRate: number;
}

export interface AgentInfo {
  id: string;
  name: string;
  description: string;
  status: 'idle' | 'working' | 'completed' | 'error';
  capabilities: string[];
  currentTask: string | null;
  lastActivity: string | null;
  metrics: AgentMetrics;
  recentActivities: string[];
}
