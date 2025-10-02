import React, { useState, useCallback } from 'react';
import { 
  Cloud, 
  Database, 
  Server, 
  Globe, 
  Shield, 
  Activity,
  DollarSign,
  Zap,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  BarChart3,
  Settings,
  Download,
  Layers
} from 'lucide-react';
import { GCPArchitecture, GCPService, ApplicationStack } from '../types/gcp';
import mockGCPData from '../data/mockGCPData.json';

interface ArchitectureDashboardProps {
  architecture: GCPArchitecture | null;
  deploymentStatus: any;
}

export const ArchitectureDashboard: React.FC<ArchitectureDashboardProps> = ({
  architecture: _architecture,
  deploymentStatus: _deploymentStatus
}) => {
  const [selectedService, setSelectedService] = useState<GCPService | null>(null);
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());
  const [showConnections, setShowConnections] = useState<string | null>(null);
  const [inspectorTab, setInspectorTab] = useState<'details' | 'cost' | 'monitoring' | 'security'>('details');
  
  // Use mock data for now - in production this would come from GCP API
  const liveData = mockGCPData as any;

  const getServiceIcon = (serviceType: string) => {
    switch (serviceType.toLowerCase()) {
      case 'cloud-run':
        return <Zap className="w-6 h-6" />;
      case 'compute-engine':
        return <Server className="w-6 h-6" />;
      case 'cloud-sql':
        return <Database className="w-6 h-6" />;
      case 'cloud-storage':
        return <Database className="w-6 h-6" />;
      case 'cloud-functions':
        return <Zap className="w-6 h-6" />;
      case 'memorystore':
        return <Layers className="w-6 h-6" />;
      case 'gke':
        return <Layers className="w-6 h-6" />;
      case 'cloud-load-balancer':
        return <Activity className="w-6 h-6" />;
      case 'firestore':
        return <Database className="w-6 h-6" />;
      case 'vpc':
        return <Shield className="w-6 h-6" />;
      default:
        return <Cloud className="w-6 h-6" />;
    }
  };

  const getServiceColor = (serviceType: string, healthStatus?: string) => {
    const baseColor = getBaseServiceColor(serviceType);
    const healthBorder = getHealthBorder(healthStatus);
    return `${baseColor} ${healthBorder}`;
  };

  const getBaseServiceColor = (serviceType: string) => {
    switch (serviceType.toLowerCase()) {
      case 'cloud-run':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'compute-engine':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'cloud-sql':
        return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'cloud-storage':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'cloud-functions':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'memorystore':
        return 'bg-pink-100 text-pink-700 border-pink-200';
      case 'gke':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'cloud-load-balancer':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'firestore':
        return 'bg-teal-100 text-teal-700 border-teal-200';
      case 'vpc':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getHealthBorder = (healthStatus?: string) => {
    switch (healthStatus) {
      case 'healthy':
        return 'border-l-4 border-l-green-500';
      case 'warning':
        return 'border-l-4 border-l-yellow-500';
      case 'critical':
        return 'border-l-4 border-l-red-500';
      default:
        return 'border-l-4 border-l-gray-300';
    }
  };

  const getHealthIcon = (healthStatus?: string) => {
    switch (healthStatus) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const handleServiceClick = (service: GCPService, event: React.MouseEvent) => {
    if (event.ctrlKey || event.metaKey) {
      // Multi-select with Ctrl/Cmd
      const newSelected = new Set(selectedServices);
      if (newSelected.has(service.id)) {
        newSelected.delete(service.id);
      } else {
        newSelected.add(service.id);
      }
      setSelectedServices(newSelected);
    } else {
      // Single select
      setSelectedService(service);
      setSelectedServices(new Set([service.id]));
    }
  };

  const handleRefresh = () => {
    // In production, this would trigger GCP API calls
    console.log('Refreshing architecture data...');
  };

  const getSelectedServicesCost = () => {
    let total = 0;
    liveData.applicationStacks.forEach(stack => {
      stack.services.forEach(service => {
        if (selectedServices.has(service.id)) {
          total += service.costEstimate?.monthly || 0;
        }
      });
    });
    return total;
  };

  // Check if we have GCP access
  if (!liveData.hasGCPAccess) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center">
          <Cloud className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Architecture Yet
          </h3>
          <p className="text-gray-600 max-w-md">
            Start a conversation in the chat to begin designing your GCP architecture.
            I'll create a visual representation of your infrastructure as we plan it together.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Live Architecture Canvas</h2>
            <p className="text-sm text-gray-600">
              Last updated: {new Date(liveData.lastRefresh).toLocaleString()}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {selectedServices.size > 1 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                <span className="text-sm font-medium text-blue-900">
                  {selectedServices.size} selected • ${getSelectedServicesCost().toFixed(2)}/month
                </span>
              </div>
            )}
            <button
              onClick={handleRefresh}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
      {/* Architecture Visualization */}
        <div className="flex-1 p-6 bg-gray-50 overflow-auto">
          {/* Application Stacks */}
          {liveData.applicationStacks && liveData.applicationStacks.map((stack: any) => (
            <div key={stack.id} className="mb-8">
              {/* Stack Header */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      stack.health_status === 'healthy' ? 'bg-green-500' :
                      stack.health_status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{stack.name}</h3>
                      <p className="text-sm text-gray-600">{stack.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">${stack.total_cost.toFixed(2)}/month</p>
                    <p className="text-sm text-gray-600">{stack.services.length} services</p>
                  </div>
                </div>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {Object.entries(stack.labels).map(([key, value]) => (
                    <span key={key} className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                      {key}: {value}
                    </span>
                  ))}
                </div>
              </div>

              {/* Services Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {stack.services.map((service) => (
                  <div
                    key={service.id}
                    onClick={(e) => handleServiceClick(service, e)}
                    onMouseEnter={() => setShowConnections(service.id)}
                    onMouseLeave={() => setShowConnections(null)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg transform hover:scale-105 ${
                      selectedServices.has(service.id)
                        ? 'ring-2 ring-blue-500 ring-opacity-50 shadow-lg'
                        : ''
                    } ${getServiceColor(service.type, service.health_status)}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {getServiceIcon(service.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-medium text-sm">{service.name}</h3>
                          {getHealthIcon(service.healthStatus)}
                        </div>
                        <p className="text-xs opacity-75 mb-2">{service.type}</p>
                        
                        {/* Key Metrics */}
                        {service.metrics && (
                          <div className="grid grid-cols-2 gap-1 text-xs mb-2">
                            {service.metrics.cpu && (
                              <div>CPU: {service.metrics.cpu}%</div>
                            )}
                            {service.metrics.memory && (
                              <div>Mem: {service.metrics.memory}%</div>
                            )}
                            {service.metrics.requests && (
                              <div>Req: {service.metrics.requests}</div>
                            )}
                            {service.metrics.invocations && (
                              <div>Inv: {service.metrics.invocations}</div>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium">
                            ${service.costEstimate?.monthly.toFixed(2) || '0'}/mo
                          </span>
                          <div className="flex items-center space-x-1">
                            <div className={`w-2 h-2 rounded-full ${
                              service.status === 'running' ? 'bg-green-500' :
                              service.status === 'deploying' ? 'bg-yellow-500' :
                              service.status === 'stopped' ? 'bg-red-500' : 'bg-gray-500'
                            }`} />
                            <span className="text-xs capitalize">{service.status}</span>
                          </div>
                        </div>
                        
                        {/* Connection indicators */}
                        {service.connections && service.connections.length > 0 && (
                          <div className="mt-2 flex items-center space-x-1">
                            <Activity className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {service.connections.length} connections
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          {/* Cost Summary */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Cost Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">${liveData.totalCost.toFixed(2)}</p>
                <p className="text-sm text-gray-600">Total Monthly Cost</p>
              </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {liveData.applicationStacks.filter(s => s.health_status === 'healthy').length}
                    </p>
                    <p className="text-sm text-gray-600">Healthy Stacks</p>
                  </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                    {liveData.applicationStacks.reduce((acc: number, stack: any) => acc + stack.services.length, 0)}
                  </p>
                  <p className="text-sm text-gray-600">Total Services</p>
                </div>
              </div>
            </div>
        </div>

        {/* Inspector Panel */}
        {selectedService && (
          <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
            {/* Inspector Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center ${getServiceColor(selectedService.type, selectedService.health_status)}`}>
                    {getServiceIcon(selectedService.type)}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{selectedService.name}</h3>
                    <p className="text-sm text-gray-600">{selectedService.type}</p>
                  </div>
                  <button
                    onClick={() => setSelectedService(null)}
                    className="ml-auto p-1 text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>

                {/* Health Status */}
                <div className="flex items-center space-x-2 mb-4">
                  {getHealthIcon(selectedService.health_status)}
                  <span className="text-sm font-medium capitalize">{selectedService.health_status || 'unknown'}</span>
                </div>
              </div>
              
              {/* Inspector Tabs */}
              <div className="flex border-b border-gray-200">
                {[
                  { id: 'details', label: 'Details', icon: Eye },
                  { id: 'cost', label: 'Cost', icon: DollarSign },
                  { id: 'monitoring', label: 'Metrics', icon: BarChart3 },
                  { id: 'security', label: 'Security', icon: Shield }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setInspectorTab(tab.id as any)}
                    className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 ${
                      inspectorTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Inspector Content */}
            <div className="flex-1 p-6 overflow-auto">
              {inspectorTab === 'details' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</p>
                      <p className="text-sm mt-1 capitalize">{selectedService.status}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Region</p>
                      <p className="text-sm mt-1">{selectedService.region}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">ARN</p>
                    <p className="text-xs font-mono bg-gray-50 p-2 rounded break-all">{selectedService.arn}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">{selectedService.description}</p>
                  </div>
                  {/* Configuration */}
                  {selectedService.configuration && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Configuration</h4>
                      <div className="space-y-2">
                        {Object.entries(selectedService.configuration).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}</span>
                            <span className="font-mono text-gray-900">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Tags */}
                  {selectedService.tags && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(selectedService.labels).map(([key, value]) => (
                          <span key={key} className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                            {key}: {value}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {inspectorTab === 'cost' && (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <span className="text-lg font-semibold text-green-900">
                        ${selectedService.cost_estimate?.monthly.toFixed(2) || '0'}/month
                      </span>
                    </div>
                    <p className="text-sm text-green-700">
                      {selectedService.cost_estimate?.breakdown || 'Cost breakdown not available'}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Cost Optimization</h4>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li>• Consider Reserved Instances for predictable workloads</li>
                      <li>• Monitor usage patterns for right-sizing opportunities</li>
                      <li>• Enable detailed monitoring for better insights</li>
                    </ul>
                  </div>
                </div>
              )}
              
              {inspectorTab === 'monitoring' && (
                <div className="space-y-4">
                  {selectedService.metrics && (
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(selectedService.metrics).map(([key, value]) => (
                        <div key={key} className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{key}</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {typeof value === 'number' ? value.toLocaleString() : value}
                            {key.includes('cpu') || key.includes('memory') ? '%' : ''}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">CloudWatch Dashboards</h4>
                    <button className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700">
                      View in CloudWatch
                    </button>
                  </div>
                </div>
              )}
              
              {inspectorTab === 'security' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Security Status</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-700">Encryption at rest enabled</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-700">VPC security groups configured</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm text-gray-700">Consider enabling detailed logging</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Recommendations</h4>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li>• Enable GCP Config for compliance monitoring</li>
                      <li>• Set up CloudTrail for audit logging</li>
                      <li>• Review IAM policies for least privilege</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
            
            {/* Inspector Actions */}
            <div className="p-6 border-t border-gray-200">
              <div className="space-y-2">
                <button className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 flex items-center justify-center space-x-2">
                  <Eye className="w-4 h-4" />
                  <span>View in GCP Console</span>
                </button>
                <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 flex items-center justify-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Export Configuration</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};