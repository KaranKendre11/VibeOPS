import React from 'react';
import { ArchitectureDashboard as ArchitectureCanvas } from './ArchitectureCanvas';
import { GCPArchitecture } from '../types/gcp';

interface ArchitectureDashboardProps {
  architecture: GCPArchitecture | null;
  deploymentStatus: any;
}

export const ArchitectureDashboard: React.FC<ArchitectureDashboardProps> = (props) => {
  try {
    return <ArchitectureCanvas {...props} />;
  } catch (error) {
    console.error('Error rendering architecture dashboard:', error);
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error Loading Dashboard
          </h3>
          <p className="text-gray-600 max-w-md">
            There was an error loading the architecture dashboard.
            Please check the browser console for details.
          </p>
        </div>
      </div>
    );
  }
};
