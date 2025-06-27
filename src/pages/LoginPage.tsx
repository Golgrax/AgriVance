import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase';
import { Button, Container, Typography, Box, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useEffect } from 'react';

const LoginPage = () => {
  const navigate = useNavigate();
  const [user, loading] = useAuthState(auth); 

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error during Google sign-in:", error);
    }
  };

  useEffect(() => {
    // pag may user na object, it means the user is logged in
    if (user) {
      // So, we navigate them to the dashboard.
      navigate('/dashboard'); 
    }
  }, [user, navigate]);
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Welcome to AgriVance
        </Typography>
        <Box sx={{ mt: 3 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleGoogleLogin}
          >
            Sign In with Google
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage;