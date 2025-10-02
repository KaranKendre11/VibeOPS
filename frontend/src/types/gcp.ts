export interface GCPServiceConfig {
  memory?: string;
  cpu?: string;
  instance_type?: string;
  tier?: string;
  storage_size?: number;
  replicas?: number;
  [key: string]: any;
}

export interface GCPServiceMetrics {
  cpu?: number;
  memory?: number;
  requests?: number;
  latency?: number;
  errors?: number;
}

export interface CostEstimate {
  monthly: number;
  breakdown: string;
  currency?: string;
}

export interface GCPService {
  id: string;
  name: string;
  type: 'cloud-run' | 'compute-engine' | 'cloud-sql' | 'cloud-storage' |
        'cloud-functions' | 'memorystore' | 'gke' | 'cloud-load-balancer' |
        'vpc' | 'firestore' | 'cloud-tasks' | 'cloud-scheduler';
  status: 'running' | 'stopped' | 'deploying' | 'error' | 'pending';
  region: string;
  project_id: string;
  description: string;
  configuration?: GCPServiceConfig;
  cost_estimate?: CostEstimate;
  metrics?: GCPServiceMetrics;
  tags?: Record<string, string>;
  labels?: Record<string, string>;
  connections?: string[];
  health_status?: 'healthy' | 'warning' | 'critical' | 'unknown';
  resource_url?: string;
  arn?: string;
  last_updated?: string;
}

export interface ApplicationStack {
  id: string;
  name: string;
  description: string;
  services: GCPService[];
  primary_service: string;
  labels: Record<string, string>;
  total_cost: number;
  health_status: 'healthy' | 'warning' | 'critical';
  vpc?: string;
  subnets?: string[];
}

export interface GCPConnection {
  id: string;
  source: string;
  target: string;
  connection_type: 'network' | 'iam' | 'data' | 'api';
  protocol?: string;
  port?: number;
  description: string;
}

export interface GCPArchitecture {
  id: string;
  name: string;
  description: string;
  project_id: string;
  application_stacks: ApplicationStack[];
  connections: GCPConnection[];
  total_cost: number;
  cost_breakdown: Record<string, number>;
  last_refresh: string;
  has_gcp_access: boolean;
}

export interface DeploymentStatus {
  deployment_id: string;
  status: 'pending' | 'planning' | 'applying' | 'completed' | 'failed' | 'rolling_back';
  progress: number;
  current_step: string;
  logs: string[];
  resources_created: string[];
  error?: string;
}
