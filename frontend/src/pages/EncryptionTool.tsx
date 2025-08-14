import React from 'react';
import { Typography, Box } from '@mui/material';

const EncryptionTool: React.FC = () => {
  return (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <Typography variant="h4" gutterBottom>
        Encryption Tool
      </Typography>
      <Typography variant="h6" color="text.secondary">
        Encryption functionality coming soon...
      </Typography>
    </Box>
  );
};

export default EncryptionTool;
