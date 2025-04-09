
import React from 'react';
import { Loader2 } from 'lucide-react';

const LocationLoadingState: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12 mb-16 md:mb-0 flex flex-col items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-rv-navy mb-4" />
      <p className="text-lg">Loading your delivery information...</p>
    </div>
  );
};

export default LocationLoadingState;
