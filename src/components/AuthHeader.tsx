
import React from 'react';
import { RVLogo } from './RVLogo';

const AuthHeader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center mb-8">
      <RVLogo className="w-20 h-20 mb-4" />
      <h1 className="text-3xl font-bold text-rv-navy">RV Eats</h1>
      <p className="text-muted-foreground text-center mt-2">
        Delicious food delivery service for RV travelers
      </p>
    </div>
  );
};

export default AuthHeader;
