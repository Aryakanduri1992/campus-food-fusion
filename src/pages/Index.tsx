
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Home from './Home';

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to home page
    navigate('/', { replace: true });
  }, [navigate]);
  
  // Return Home component directly to avoid blank page while redirecting
  return <Home />;
};

export default Index;
