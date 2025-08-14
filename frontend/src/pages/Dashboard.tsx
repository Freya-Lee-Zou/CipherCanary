import React, { useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { fetchAlgorithms } from '../store/slices/encryptionSlice';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { algorithms, loading } = useSelector((state: RootState) => state.encryption);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchAlgorithms());
    }
  }, [dispatch, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h4" gutterBottom>
          Welcome to CipherCanary
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Your modern cryptography and security toolkit
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/login')}
            sx={{ mr: 2 }}
          >
            Login
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/register')}
          >
            Register
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome back, {user?.username}! 👋
      </Typography>
      <Typography variant="h6" color="text.secondary" paragraph>
        Manage your encryption operations and security keys
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => navigate('/encrypt')}
                  sx={{ mb: 2 }}
                >
                  🔐 Encrypt Data
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate('/keys')}
                >
                  🔑 Manage Keys
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* System Status */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Status
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Available Algorithms: {algorithms.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  User Role: {user?.role}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Account Status: {user?.is_active ? 'Active' : 'Inactive'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Available Algorithms */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Available Encryption Algorithms
            </Typography>
            {loading ? (
              <Typography>Loading algorithms...</Typography>
            ) : (
              <Grid container spacing={2}>
                {algorithms.map((algorithm) => (
                  <Grid item xs={12} sm={6} md={3} key={algorithm.value}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom>
                          {algorithm.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Type: {algorithm.type}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Value: {algorithm.value}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
