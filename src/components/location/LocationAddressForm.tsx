
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { MapPin, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { UseFormReturn } from 'react-hook-form';

// Re-use the schema from the original file
const locationSchema = z.object({
  address: z.string().min(5, 'Address is required and must be at least 5 characters'),
  landmark: z.string().optional(),
  pincode: z.string().min(6, 'Please enter a valid 6-digit pincode').max(6),
  city: z.string().min(2, 'City is required'),
  instructions: z.string().optional(),
});

export type LocationFormValues = z.infer<typeof locationSchema>;

interface LocationAddressFormProps {
  form: UseFormReturn<LocationFormValues>;
  onSubmit: (data: LocationFormValues) => void;
  loading: boolean;
  usingCurrentLocation: boolean;
  detectCurrentLocation: () => void;
}

const LocationAddressForm: React.FC<LocationAddressFormProps> = ({
  form,
  onSubmit,
  loading,
  usingCurrentLocation,
  detectCurrentLocation
}) => {
  const navigate = useNavigate();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : 'Continue to Payment'}
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
  );
};

export default LocationAddressForm;
