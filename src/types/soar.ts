export interface Alert {
  id: string;
  name: string;
  sourceIP: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  status: 'new' | 'investigating' | 'resolved' | 'closed';
  timestamp: string;
  description: string;
  whatHappened: string;
  nextSteps: string[];
  affectedAssets?: string[];
  threatIntel?: {
    malwareFamily?: string;
    iocs?: string[];
    confidence?: number;
  };
}

export interface PlaybookStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

export interface Playbook {
  id: string;
  name: string;
  description: string;
  steps: PlaybookStep[];
  triggerConditions: string[];
  estimatedTime: string;
}

export type NavigationItem = {
  id: string;
  name: string;
  path: string;
  icon: string;
};