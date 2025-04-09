
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const CartLoadingState: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12 flex flex-col mb-16 md:mb-0">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
      <div className="w-full mb-6">
        <Progress value={65} className="h-1 w-full bg-gray-200" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {[1, 2].map((i) => (
            <Card key={i} className="mb-4">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <Skeleton className="w-24 h-24 rounded" />
                  <div className="flex-grow w-full">
                    <div className="flex justify-between items-start">
                      <Skeleton className="h-6 w-32 mb-2" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                    <Skeleton className="h-4 w-full mb-4" />
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex items-center">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-6 w-6 mx-3" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div>
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4">Order Summary</h3>
              <div className="space-y-3 mb-6">
                {[1, 2].map((i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between font-bold text-lg">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
              <Skeleton className="h-10 w-full mt-6" />
              <Skeleton className="h-10 w-full mt-3" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CartLoadingState;
