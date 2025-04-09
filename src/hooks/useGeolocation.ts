
import { useState } from 'react';
import { toast } from 'sonner';

interface UseGeolocationProps {
  onLocationDetected: (lat: number, lng: number) => void;
}

export function useGeolocation({ onLocationDetected }: UseGeolocationProps) {
  const [usingCurrentLocation, setUsingCurrentLocation] = useState(false);
  const [currentCoordinates, setCurrentCoordinates] = useState<{lat: number, lng: number} | null>(null);

  const detectCurrentLocation = () => {
    setUsingCurrentLocation(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentCoordinates({ lat: latitude, lng: longitude });
          
          // Call the callback with the coordinates
          onLocationDetected(latitude, longitude);
          
          setUsingCurrentLocation(false);
          toast.success('Location detected successfully');
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Failed to detect location. Please enter manually.');
          setUsingCurrentLocation(false);
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
      setUsingCurrentLocation(false);
    }
  };

  return {
    usingCurrentLocation,
    currentCoordinates,
    detectCurrentLocation
  };
}
