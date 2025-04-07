
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 mb-16 md:mb-0">
      {/* Hero Section */}
      <div className="relative rounded-xl overflow-hidden mb-12">
        <div className="absolute inset-0 bg-gradient-to-r from-rv-navy/90 to-rv-burgundy/70 z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1170&auto=format&fit=crop" 
          alt="Delicious Food" 
          className="w-full h-[400px] object-cover"
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-center items-start p-8 md:p-16">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            RV University <span className="text-rv-gold">Food Delivery</span>
          </h1>
          <p className="text-lg md:text-xl text-white mb-8 max-w-lg">
            Delicious meals delivered directly to your dorm or campus location.
          </p>
          <Link to="/menu">
            <Button size="lg" className="bg-rv-gold text-rv-navy hover:bg-rv-gold/90">
              Order Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Featured Categories */}
      <h2 className="text-2xl font-bold mb-6">Explore Categories</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Link to="/menu?category=Veg">
          <Card className="h-48 overflow-hidden group cursor-pointer">
            <div className="relative h-full">
              <img 
                src="https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=1084&auto=format&fit=crop" 
                alt="Vegetarian" 
                className="h-full w-full object-cover transform group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-all">
                <h3 className="text-2xl font-bold text-white">Vegetarian</h3>
              </div>
            </div>
          </Card>
        </Link>
        
        <Link to="/menu?category=Non-Veg">
          <Card className="h-48 overflow-hidden group cursor-pointer">
            <div className="relative h-full">
              <img 
                src="https://images.unsplash.com/photo-1603360946369-dc9bb6258143?q=80&w=1035&auto=format&fit=crop" 
                alt="Non-Vegetarian" 
                className="h-full w-full object-cover transform group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-all">
                <h3 className="text-2xl font-bold text-white">Non-Vegetarian</h3>
              </div>
            </div>
          </Card>
        </Link>
        
        <Link to="/menu?category=Beverage">
          <Card className="h-48 overflow-hidden group cursor-pointer">
            <div className="relative h-full">
              <img 
                src="https://images.unsplash.com/photo-1489365091240-6a18fc761ec2?q=80&w=1095&auto=format&fit=crop" 
                alt="Beverages" 
                className="h-full w-full object-cover transform group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-all">
                <h3 className="text-2xl font-bold text-white">Beverages</h3>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* How It Works */}
      <h2 className="text-2xl font-bold mb-6">How It Works</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-rv-navy text-white flex items-center justify-center text-xl font-bold mb-4">1</div>
              <h3 className="text-lg font-semibold mb-2">Browse Menu</h3>
              <p className="text-gray-600">Explore our wide range of food options from campus vendors.</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-rv-burgundy text-white flex items-center justify-center text-xl font-bold mb-4">2</div>
              <h3 className="text-lg font-semibold mb-2">Add to Cart</h3>
              <p className="text-gray-600">Select your favorite items and add them to your cart.</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-rv-gold text-rv-navy flex items-center justify-center text-xl font-bold mb-4">3</div>
              <h3 className="text-lg font-semibold mb-2">Get Delivery</h3>
              <p className="text-gray-600">Confirm your order and get food delivered to your location.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Home;
