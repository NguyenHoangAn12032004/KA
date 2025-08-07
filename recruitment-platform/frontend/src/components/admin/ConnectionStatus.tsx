import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { 
  SignalCellular0Bar as SignalOffIcon,
  SignalCellular4Bar as SignalOnIcon,
  CloudOff as CloudOffIcon,
  Cloud as CloudOnIcon
} from '@mui/icons-material';

interface ConnectionStatusProps {
  connected: boolean;
  enabled: boolean;
  lastUpdated?: Date;
  className?: string;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ 
  connected, 
  enabled, 
  lastUpdated,
  className
}) => {
  if (!enabled) {
    return (
      <Box className={className} display="flex" alignItems="center">
        <Chip 
          icon={<CloudOffIcon fontSize="small" />}
          label="Realtime đã tắt" 
          color="default"
          size="small"
        />
      </Box>
    );
  }

  return (
    <Box className={className} display="flex" alignItems="center">
      <Chip 
        icon={connected ? <SignalOnIcon fontSize="small" /> : <SignalOffIcon fontSize="small" />}
        label={connected ? "Đã kết nối" : "Đang kết nối..."} 
        color={connected ? "success" : "warning"}
        size="small"
        sx={{
          '& .MuiChip-icon': {
            animation: connected ? 'pulse 1.5s infinite' : 'none'
          }
        }}
      />
      
      {lastUpdated && (
        <Typography variant="caption" sx={{ ml: 1 }}>
          Cập nhật lần cuối: {lastUpdated.toLocaleTimeString()}
        </Typography>
      )}
    </Box>
  );
};

export default ConnectionStatus;
