import React from 'react';
import { Box, Text } from 'ink';

interface Props {
  status: 'idle' | 'planning' | 'executing' | 'verified';
  progress: number; // 0 to 100
}

export const AutopilotStatusBar: React.FC<Props> = ({ status, progress }) => {
  const statusColors = {
    idle: 'gray',
    planning: 'blue',
    executing: 'cyan',
    verified: 'green',
  };

  return (
    <Box flexDirection="column" marginTop={1}>
      <Box>
        <Text color="white">Onyx Autopilot: </Text>
        <Text color={statusColors[status]}>{status.toUpperCase()}</Text>
      </Box>
      <Box width={40} borderStyle="single" paddingLeft={1} paddingRight={1}>
        <Text>{'█'.repeat(Math.floor(progress / 5))}{'░'.repeat(20 - Math.floor(progress / 5))}</Text>
      </Box>
    </Box>
  );
};
