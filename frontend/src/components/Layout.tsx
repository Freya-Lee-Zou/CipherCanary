import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/slices/authSlice';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            🔐 CipherCanary
          </Typography>
          
          {isAuthenticated ? (
            <>
              <Button
                color="inherit"
                onClick={() => navigate('/')}
                sx={{ mx: 1, opacity: isActive('/') ? 1 : 0.7 }}
              >
                Dashboard
              </Button>
              <Button
                color="inherit"
                onClick={() => navigate('/encrypt')}
                sx={{ mx: 1, opacity: isActive('/encrypt') ? 1 : 0.7 }}
              >
                Encrypt
              </Button>
              <Button
                color="inherit"
                onClick={() => navigate('/keys')}
                sx={{ mx: 1, opacity: isActive('/keys') ? 1 : 0.7 }}
              >
                Keys
              </Button>
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button
                color="inherit"
                onClick={() => navigate('/login')}
                sx={{ mx: 1, opacity: isActive('/login') ? 1 : 0.7 }}
              >
                Login
              </Button>
              <Button
                color="inherit"
                onClick={() => navigate('/register')}
                sx={{ mx: 1, opacity: isActive('/register') ? 1 : 0.7 }}
              >
                Register
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Container component="main" sx={{ flexGrow: 1, py: 4 }}>
        {children}
      </Container>

      <Box component="footer" sx={{ py: 3, textAlign: 'center', bgcolor: 'background.paper' }}>
        <Typography variant="body2" color="text.secondary">
          © 2024 CipherCanary. Secure cryptography toolkit.
        </Typography>
      </Box>
    </Box>
  );
};

export default Layout;
