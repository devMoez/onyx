import React from 'react';
import { Box, Text } from 'ink';
import { AutopilotStatusBar } from './AutopilotStatusBar.js';

export const Dashboard: React.FC = () => {
  // Placeholder state for demonstration
  const [status] = React.useState<'idle' | 'planning' | 'executing' | 'verified'>('executing');
  const [progress] = React.useState(75);

  return (
    <Box flexDirection="column" padding={1} borderStyle="round">
      <Text bold color="green">ONYX SYSTEM DASHBOARD</Text>
      <AutopilotStatusBar status={status} progress={progress} />
      <Box marginTop={1}>
        <Text color="yellow">Active Subsystems: System-Controller, Vision-Engine</Text>
      </Box>
    </Box>
  );
};
