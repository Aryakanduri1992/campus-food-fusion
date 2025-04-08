
import React from 'react';
import { MapPin } from 'lucide-react';

interface DeliveryMapProps {
  pickupAddress: string;
  deliveryAddress: string;
}

const DeliveryMap: React.FC<DeliveryMapProps> = ({ pickupAddress, deliveryAddress }) => {
  // In a real application, this would use an actual map API like Google Maps, Mapbox, etc.
  // For this demo, we'll create a visual representation
  
  return (
    <div className="w-full h-full relative rounded-lg overflow-hidden border bg-gray-100">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-gray-100"></div>
      
      {/* Restaurant Location */}
      <div className="absolute top-1/3 left-1/4 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
        <div className="w-12 h-12 rounded-full bg-rv-navy flex items-center justify-center">
          <MapPin className="h-6 w-6 text-white" />
        </div>
        <div className="mt-2 bg-white p-2 rounded-lg shadow-md text-xs max-w-xs text-center">
          <p className="font-semibold">Restaurant</p>
          <p className="text-gray-600 text-xs">{pickupAddress}</p>
        </div>
      </div>
      
      {/* Customer Location */}
      <div className="absolute bottom-1/3 right-1/4 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
        <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center">
          <MapPin className="h-6 w-6 text-white" />
        </div>
        <div className="mt-2 bg-white p-2 rounded-lg shadow-md text-xs max-w-xs text-center">
          <p className="font-semibold">Customer</p>
          <p className="text-gray-600 text-xs">{deliveryAddress}</p>
        </div>
      </div>
      
      {/* Route Path (simplified representation) */}
      <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
        <path 
          d="M 30% 33% Q 50% 50%, 70% 66%" 
          stroke="#3B82F6" 
          strokeWidth="4"
          strokeDasharray="8 4"
          fill="none" 
        />
      </svg>
      
      {/* Distance Indicator */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="bg-white px-3 py-1 rounded-full shadow-md text-xs">
          <p className="font-semibold text-rv-navy">~5.8 km</p>
        </div>
      </div>
      
      <div className="absolute bottom-4 left-4 right-4 bg-white bg-opacity-70 p-2 rounded-lg text-xs text-center">
        This is a simulated map for demonstration. In a production environment, this would be replaced with a real map using Google Maps, Mapbox, or similar APIs.
      </div>
    </div>
  );
};

export default DeliveryMap;
