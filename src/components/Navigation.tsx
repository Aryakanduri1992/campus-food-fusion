
import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, ClipboardList, User, LogOut, LogIn, Settings, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Navigation: React.FC = () => {
  const location = useLocation();
  const { getTotalItems } = useCart();
  const { user, userRole, signOut, checkUserRole, refreshUserRole } = useAuth();
  const { toast } = useToast();
  
  // Debug userRole and refresh when component mounts
  useEffect(() => {
    console.log("Current user role in Navigation:", userRole);
    console.log("Current user email:", user?.email);
    
    // Force refresh the user role when Navigation mounts
    if (user) {
      refreshUserRole().then(() => {
        console.log("Updated role after refresh in Navigation:", userRole);
      });
    }
  }, [user, refreshUserRole]);
  
  // Add additional effect to respond to userRole changes
  useEffect(() => {
    console.log("UserRole changed in Navigation:", userRole);
  }, [userRole]);
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const isOwner = userRole === 'owner';
  const isDeliveryPartner = userRole === 'delivery_partner';

  console.log("Is owner?", isOwner);
  console.log("Is delivery partner?", isDeliveryPartner);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    }
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
            
            {!isDeliveryPartner && (
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
            )}
            
            {user && !isDeliveryPartner && !isOwner && (
              <Link to="/orders" className={`flex items-center space-x-2 ${isActive('/orders') ? 'text-rv-gold' : 'hover:text-rv-gold'}`}>
                <User size={20} />
                <span>My Orders</span>
              </Link>
            )}
            
            {isOwner && (
              <Link to="/owner" className={`flex items-center space-x-2 ${isActive('/owner') ? 'text-rv-gold' : 'hover:text-rv-gold'}`}>
                <Settings size={20} />
                <span>Owner Dashboard</span>
              </Link>
            )}
            
            {isDeliveryPartner && (
              <Link to="/delivery" className={`flex items-center space-x-2 ${isActive('/delivery') ? 'text-rv-gold' : 'hover:text-rv-gold'}`}>
                <Truck size={20} />
                <span>Delivery Dashboard</span>
              </Link>
            )}
            
            {user ? (
              <Button 
                variant="ghost" 
                onClick={handleSignOut} 
                className="flex items-center space-x-2 hover:text-rv-gold"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </Button>
            ) : (
              <Link 
                to="/auth" 
                className={`flex items-center space-x-2 ${isActive('/auth') ? 'text-rv-gold' : 'hover:text-rv-gold'}`}
              >
                <LogIn size={20} />
                <span>Login</span>
              </Link>
            )}
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
            
            {!isDeliveryPartner && (
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
            )}
            
            {isOwner ? (
              <Link to="/owner" className={`flex flex-col items-center ${isActive('/owner') ? 'text-rv-gold' : ''}`}>
                <Settings size={20} />
                <span className="text-xs">Owner</span>
              </Link>
            ) : isDeliveryPartner ? (
              <Link to="/delivery" className={`flex flex-col items-center ${isActive('/delivery') ? 'text-rv-gold' : ''}`}>
                <Truck size={20} />
                <span className="text-xs">Delivery</span>
              </Link>
            ) : user ? (
              <Link to="/orders" className={`flex flex-col items-center ${isActive('/orders') ? 'text-rv-gold' : ''}`}>
                <User size={20} />
                <span className="text-xs">Orders</span>
              </Link>
            ) : null}
            
            {user ? (
              <button 
                onClick={handleSignOut}
                className={`flex flex-col items-center`}
              >
                <LogOut size={20} />
                <span className="text-xs">Logout</span>
              </button>
            ) : (
              <Link to="/auth" className={`flex flex-col items-center ${isActive('/auth') ? 'text-rv-gold' : ''}`}>
                <LogIn size={20} />
                <span className="text-xs">Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
