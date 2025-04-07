
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, ClipboardList, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';

const Navigation: React.FC = () => {
  const location = useLocation();
  const { getTotalItems } = useCart();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="sticky top-0 z-10 bg-rv-navy text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo and Brand */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">RV Eats</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className={`flex items-center space-x-2 ${isActive('/') ? 'text-rv-gold' : 'hover:text-rv-gold'}`}>
              <Home size={20} />
              <span>Home</span>
            </Link>
            <Link to="/menu" className={`flex items-center space-x-2 ${isActive('/menu') ? 'text-rv-gold' : 'hover:text-rv-gold'}`}>
              <ClipboardList size={20} />
              <span>Menu</span>
            </Link>
            <Link to="/cart" className={`flex items-center space-x-2 ${isActive('/cart') ? 'text-rv-gold' : 'hover:text-rv-gold'}`}>
              <div className="relative">
                <ShoppingCart size={20} />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-rv-burgundy text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </div>
              <span>Cart</span>
            </Link>
            <Link to="/orders" className={`flex items-center space-x-2 ${isActive('/orders') ? 'text-rv-gold' : 'hover:text-rv-gold'}`}>
              <User size={20} />
              <span>My Orders</span>
            </Link>
          </div>

          {/* Mobile Navigation - Bottom Bar */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-rv-navy text-white p-2 flex justify-around">
            <Link to="/" className={`flex flex-col items-center ${isActive('/') ? 'text-rv-gold' : ''}`}>
              <Home size={20} />
              <span className="text-xs">Home</span>
            </Link>
            <Link to="/menu" className={`flex flex-col items-center ${isActive('/menu') ? 'text-rv-gold' : ''}`}>
              <ClipboardList size={20} />
              <span className="text-xs">Menu</span>
            </Link>
            <Link to="/cart" className={`flex flex-col items-center ${isActive('/cart') ? 'text-rv-gold' : ''}`}>
              <div className="relative">
                <ShoppingCart size={20} />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-rv-burgundy text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </div>
              <span className="text-xs">Cart</span>
            </Link>
            <Link to="/orders" className={`flex flex-col items-center ${isActive('/orders') ? 'text-rv-gold' : ''}`}>
              <User size={20} />
              <span className="text-xs">Orders</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
