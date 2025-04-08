
import React from 'react';
import { Loader2, Skeleton } from 'lucide-react';

const LoadingState: React.FC = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-rv-navy flex items-center">
        <div className="h-10 w-64 bg-gray-200 rounded animate-pulse"></div>
      </h1>
      
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-16 w-16 animate-spin text-rv-burgundy mb-6" />
        <h2 className="text-2xl font-semibold text-rv-navy mb-2">Preparing Owner Dashboard</h2>
        <p className="text-gray-500 mb-8 text-center max-w-md">
          Please wait while we verify your credentials and load your dashboard...
        </p>
        
        <div className="w-full max-w-md space-y-3">
          <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingState;
