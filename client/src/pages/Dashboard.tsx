import React from 'react';
import { MatchLiveState } from '../../../shared/types';
import { CommandCenter } from './CommandCenter';

interface DashboardProps {
  state: MatchLiveState | null;
  isConnected: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ state, isConnected }) => {
  return <CommandCenter state={state} isConnected={isConnected} />;
};

export default Dashboard;
