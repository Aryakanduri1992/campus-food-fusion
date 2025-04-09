
import Home from './Home';

// This component was causing redirects that could lead to infinite loops
const Index = () => {
  // Return Home component directly instead of redirecting
  return <Home />;
};

export default Index;
