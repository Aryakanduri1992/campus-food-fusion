
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext'; 
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Import our new components
import LocationAddressForm, { LocationFormValues } from '@/components/location/LocationAddressForm';
import OrderSummaryCard from '@/components/location/OrderSummaryCard';
import LocationLoadingState from '@/components/location/LocationLoadingState';
import LocationEmptyCart from '@/components/location/LocationEmptyCart';
import { useGeolocation } from '@/hooks/useGeolocation';

// Re-export the schema for consistency
const locationSchema = z.object({
  address: z.string().min(5, 'Address is required and must be at least 5 characters'),
  landmark: z.string().optional(),
  pincode: z.string().min(6, 'Please enter a valid 6-digit pincode').max(6),
  city: z.string().min(2, 'City is required'),
  instructions: z.string().optional(),
});

const Location: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { cart, getTotalPrice, fetchCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(true);
  
  // Get data from location state or use cart data
  const orderId = location.state?.orderId;
  const totalAmount = location.state?.totalAmount || getTotalPrice();
  
  console.log("Location page - Order ID:", orderId);
  console.log("Location page - Total Amount:", totalAmount);
  
  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      address: '',
      landmark: '',
      pincode: '',
      city: '',
      instructions: '',
    }
  });

  // Use our custom hook for geolocation
  const { usingCurrentLocation, currentCoordinates, detectCurrentLocation } = useGeolocation({
    onLocationDetected: (lat, lng) => fetchAddressFromCoordinates(lat, lng)
  });

  useEffect(() => {
    // Fetch latest cart data when component mounts
    const loadCart = async () => {
      setCartLoading(true);
      await fetchCart();
      setCartLoading(false);
    };
    
    loadCart();
  }, [fetchCart]);

  useEffect(() => {
    // Check if we have an order ID from state, if not and cart is empty, redirect
    if (!cartLoading && cart.length === 0 && !orderId && !totalAmount) {
      toast.error('Your cart is empty');
      navigate('/cart');
    }
  }, [cart, orderId, navigate, cartLoading, totalAmount]);

  const fetchAddressFromCoordinates = async (lat: number, lng: number) => {
    try {
      // Normally we would use Google Maps Geocoding API here
      // For this demo, let's just set a mock address
      form.setValue('address', `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      form.setValue('city', 'Sample City');
      form.setValue('pincode', '123456');
    } catch (error) {
      console.error('Error fetching address:', error);
    }
  };

  const onSubmit = (data: LocationFormValues) => {
    setLoading(true);
    
    // Process the form data
    setTimeout(() => {
      setLoading(false);
      
      // Always ensure required data is passed to payment page
      const totalAmountValue = totalAmount || getTotalPrice();
      
      // Navigate to payment with both order and location data
      navigate('/payment', { 
        state: { 
          orderId: orderId,
          totalAmount: totalAmountValue,
          locationData: {
            ...data,
            totalAmount: totalAmountValue,
            coordinates: currentCoordinates
          }
        } 
      });
    }, 500);
  };

  // Show loading state while cart is being fetched
  if (cartLoading) {
    return <LocationLoadingState />;
  }

  // Fallback if no orderId and cart is empty
  if (cart.length === 0 && !orderId && !totalAmount) {
    return <LocationEmptyCart />;
  }

  return (
    <div className="container mx-auto px-4 py-8 mb-16 md:mb-0">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-rv-navy">Delivery Location</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderSummaryCard orderId={orderId} totalAmount={totalAmount} />
            
            <LocationAddressForm
              form={form}
              onSubmit={onSubmit}
              loading={loading}
              usingCurrentLocation={usingCurrentLocation}
              detectCurrentLocation={detectCurrentLocation}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Location;
