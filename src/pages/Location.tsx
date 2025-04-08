
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { MapPin, Navigation } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext'; // Import cart context
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const locationSchema = z.object({
  address: z.string().min(5, 'Address is required and must be at least 5 characters'),
  landmark: z.string().optional(),
  pincode: z.string().min(6, 'Please enter a valid 6-digit pincode').max(6),
  city: z.string().min(2, 'City is required'),
  instructions: z.string().optional(),
});

type LocationFormValues = z.infer<typeof locationSchema>;

const Location: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { cart, getTotalPrice } = useCart(); // Get cart from context
  const [loading, setLoading] = useState(false);
  const [usingCurrentLocation, setUsingCurrentLocation] = useState(false);
  const [currentCoordinates, setCurrentCoordinates] = useState<{lat: number, lng: number} | null>(null);
  
  const orderId = location.state?.orderId;
  const totalAmount = location.state?.totalAmount || getTotalPrice(); // Fallback to cart total
  
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

  useEffect(() => {
    // Check if cart is empty
    if (cart.length === 0 && !orderId) {
      toast.error('Your cart is empty');
      navigate('/cart');
    }
  }, [cart, orderId, navigate]);

  const detectCurrentLocation = () => {
    setUsingCurrentLocation(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentCoordinates({ lat: latitude, lng: longitude });
          
          // Fetch address from coordinates using reverse geocoding
          fetchAddressFromCoordinates(latitude, longitude);
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
      
      // Navigate to payment with both order and location data
      navigate('/payment', { 
        state: { 
          orderId: orderId,
          totalAmount: totalAmount,
          locationData: {
            ...data,
            coordinates: currentCoordinates
          }
        } 
      });
    }, 1000);
  };

  // Fallback if no orderId and cart is empty
  if (cart.length === 0 && !orderId) {
    return (
      <div className="container mx-auto px-4 py-12 mb-16 md:mb-0">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center text-rv-navy">Empty Cart</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p>Your cart is empty.</p>
            <Button onClick={() => navigate('/menu')}>Browse Menu</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mb-16 md:mb-0">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-rv-navy">Delivery Location</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-4 bg-gray-50 rounded-md">
              <div className="flex justify-between">
                <span className="font-semibold">Order ID:</span>
                <span className="text-gray-600">{orderId ? orderId.substring(0, 8) : 'New Order'}</span>
              </div>
              <div className="flex justify-between mt-2">
                <span className="font-semibold">Total Amount:</span>
                <span className="font-bold text-rv-burgundy">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>
            
            <Button 
              onClick={detectCurrentLocation} 
              type="button" 
              className="w-full mb-6"
              variant="outline"
              disabled={usingCurrentLocation}
            >
              {usingCurrentLocation ? 'Detecting Location...' : 'Use Current Location'}
              <MapPin className="ml-2 h-4 w-4" />
            </Button>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Address</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter your full address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="landmark"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Landmark (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Nearby landmark" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="pincode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pincode</FormLabel>
                        <FormControl>
                          <Input placeholder="123456" {...field} maxLength={6} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="Your city" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="instructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Delivery Instructions (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Any special instructions for delivery" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit"
                  className="w-full bg-rv-navy hover:bg-rv-burgundy"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Continue to Payment'}
                </Button>
                
                <Button 
                  type="button"
                  variant="outline"
                  className="w-full mt-2"
                  onClick={() => navigate('/cart')}
                  disabled={loading}
                >
                  Back to Cart
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Location;
