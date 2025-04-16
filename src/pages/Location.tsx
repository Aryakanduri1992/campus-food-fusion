import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext'; 
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import LocationAddressForm, { LocationFormValues } from '@/components/location/LocationAddressForm';
import OrderSummaryCard from '@/components/location/OrderSummaryCard';
import LocationLoadingState from '@/components/location/LocationLoadingState';
import LocationEmptyCart from '@/components/location/LocationEmptyCart';
import { useGeolocation } from '@/hooks/useGeolocation';

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
  const [error, setError] = useState<string | null>(null);
  
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
    },
    mode: 'onChange',
  });

  const { usingCurrentLocation, currentCoordinates, detectCurrentLocation } = useGeolocation({
    onLocationDetected: (lat, lng) => fetchAddressFromCoordinates(lat, lng)
  });

  useEffect(() => {
    const loadCart = async () => {
      setCartLoading(true);
      try {
        await fetchCart();
        setError(null);
      } catch (err) {
        console.error('Error loading cart:', err);
        setError('Failed to load cart. Please try again.');
      } finally {
        setCartLoading(false);
      }
    };
    
    loadCart();
  }, [fetchCart]);

  useEffect(() => {
    if (!cartLoading && cart.length === 0 && !orderId && !totalAmount) {
      toast.error('Your cart is empty');
      navigate('/cart', { replace: true });
    }
  }, [cart, orderId, navigate, cartLoading, totalAmount]);

  const fetchAddressFromCoordinates = async (lat: number, lng: number) => {
    try {
      form.setValue('address', `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      form.setValue('city', 'Sample City');
      form.setValue('pincode', '123456');
    } catch (error) {
      console.error('Error fetching address:', error);
      toast.error('Failed to fetch address from your location');
    }
  };

  const onSubmit = async (data: LocationFormValues) => {
    setLoading(true);
    
    try {
      if (!user) {
        toast.error("Please log in to continue");
        navigate('/auth', { replace: true });
        return;
      }
      
      const totalAmountValue = totalAmount || getTotalPrice();
      
      if (!totalAmountValue || totalAmountValue <= 0) {
        setError("Invalid total amount. Please try again.");
        toast.error("Invalid total amount");
        return;
      }
      
      const locationData = {
        address: data.address,
        city: data.city,
        pincode: data.pincode,
        landmark: data.landmark || '',
        instructions: data.instructions || '',
        totalAmount: totalAmountValue
      };

      navigate('/payment', { 
        state: { 
          orderId,
          totalAmount: totalAmountValue,
          locationData
        },
        replace: true
      });
    } catch (error) {
      console.error("Error proceeding to payment:", error);
      setError("Failed to proceed to payment. Please try again.");
      toast.error("Failed to proceed to payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (cartLoading) {
    return <LocationLoadingState />;
  }

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
            <OrderSummaryCard 
              orderId={orderId} 
              totalAmount={totalAmount}
              error={error} 
            />
            
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
