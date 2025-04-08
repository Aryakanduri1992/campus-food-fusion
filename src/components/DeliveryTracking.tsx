
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Truck, MapPin, Check } from 'lucide-react';

interface DeliveryTrackingProps {
  orderId: string;
  estimatedTime?: number; // in minutes
  coordinates?: { lat: number; lng: number } | null;
}

const DeliveryTracking: React.FC<DeliveryTrackingProps> = ({ 
  orderId, 
  estimatedTime = 30,
  coordinates 
}) => {
  const [status, setStatus] = useState<'Preparing' | 'On the way' | 'Arriving' | 'Delivered'>('Preparing');
  const [remainingTime, setRemainingTime] = useState(estimatedTime);
  const [deliveryProgress, setDeliveryProgress] = useState(0);
  
  // Simulate delivery progress
  useEffect(() => {
    if (status === 'Delivered') return;
    
    const interval = setInterval(() => {
      if (remainingTime <= 0) {
        setStatus('Delivered');
        setDeliveryProgress(100);
        clearInterval(interval);
        return;
      }
      
      setRemainingTime(prev => {
        const newTime = prev - 1;
        // Update status based on time remaining
        if (newTime <= estimatedTime * 0.2) {
          setStatus('Arriving');
        } else if (newTime <= estimatedTime * 0.6) {
          setStatus('On the way');
        }
        
        // Calculate progress percentage
        const progress = 100 - (newTime / estimatedTime * 100);
        setDeliveryProgress(progress);
        
        return newTime;
      });
    }, 60000); // Update every minute
    
    // For demo purposes, update more frequently
    const demoInterval = setInterval(() => {
      setDeliveryProgress(prev => {
        if (prev >= 100) {
          clearInterval(demoInterval);
          setStatus('Delivered');
          return 100;
        }
        
        // Update status based on progress
        if (prev >= 80) {
          setStatus('Arriving');
        } else if (prev >= 40) {
          setStatus('On the way');
        }
        
        return prev + 2;
      });
    }, 3000); // Update every 3 seconds for demo
    
    return () => {
      clearInterval(interval);
      clearInterval(demoInterval);
    };
  }, [estimatedTime]);
  
  const getStatusColor = () => {
    switch (status) {
      case 'Preparing':
        return 'bg-blue-100 text-blue-800';
      case 'On the way':
        return 'bg-yellow-100 text-yellow-800';
      case 'Arriving':
        return 'bg-orange-100 text-orange-800';
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Delivery Status</CardTitle>
          <Badge className={getStatusColor()}>{status}</Badge>
        </div>
        <p className="text-sm text-gray-500">
          Order #{orderId.substring(0, 8)}
        </p>
      </CardHeader>
      <CardContent>
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-rv-navy h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${deliveryProgress}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>Ordered</span>
            <span>Preparing</span>
            <span>On the way</span>
            <span>Delivered</span>
          </div>
        </div>
        
        <div className="mt-6 space-y-3">
          <div className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-rv-navy" />
            {status === 'Delivered' ? (
              <span>Delivered!</span>
            ) : (
              <span>Estimated delivery in {remainingTime} minutes</span>
            )}
          </div>
          
          <div className="flex items-center">
            <Truck className="h-5 w-5 mr-2 text-rv-navy" />
            <span>Your order is {status.toLowerCase()}</span>
          </div>
          
          <div className="flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-rv-navy" />
            <span>Delivery to your location</span>
          </div>
          
          {status === 'Delivered' && (
            <div className="flex items-center text-green-600">
              <Check className="h-5 w-5 mr-2" />
              <span>Successfully delivered!</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DeliveryTracking;
