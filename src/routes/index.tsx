
import React from 'react';
import { Navigate, RouteObject } from 'react-router-dom';
import Home from '@/pages/Home';
import Menu from '@/pages/Menu';
import Cart from '@/pages/Cart';
import Orders from '@/pages/Orders';
import Payment from '@/pages/Payment';
import Location from '@/pages/Location';
import Owner from '@/pages/Owner';
import DeliveryPartner from '@/pages/DeliveryPartner';
import Auth from '@/pages/Auth';
import NotFound from '@/pages/NotFound';
import CustomerRoutes from './CustomerRoutes';
import OwnerRoutes from './OwnerRoutes';
import DeliveryRoutes from './DeliveryRoutes';
import ProtectedRoute from './ProtectedRoute';

// Define all application routes
const routes: RouteObject[] = [
  // Public routes
  {
    path: '/',
    element: <Home />
  },
  {
    path: '/menu',
    element: <Menu />
  },
  {
    path: '/auth',
    element: <Auth />
  },
  
  // Customer-specific routes
  {
    path: '/customer',
    element: <CustomerRoutes />,
    children: [
      {
        path: 'cart',
        element: <Cart />
      },
      {
        path: 'orders',
        element: <Orders />
      },
      {
        path: 'payment',
        element: <Payment />
      },
      {
        path: 'location',
        element: <Location />
      },
      {
        path: '',
        element: <Navigate to="/customer/orders" replace />
      }
    ]
  },
  
  // Owner-specific routes
  {
    path: '/owner',
    element: <OwnerRoutes />,
    children: [
      {
        path: 'dashboard',
        element: <Owner />
      },
      {
        path: '',
        element: <Navigate to="/owner/dashboard" replace />
      }
    ]
  },
  
  // Delivery partner-specific routes
  {
    path: '/delivery',
    element: <DeliveryRoutes />,
    children: [
      {
        path: 'dashboard',
        element: <DeliveryPartner />
      },
      {
        path: '',
        element: <Navigate to="/delivery/dashboard" replace />
      }
    ]
  },
  
  // Legacy routes for backward compatibility
  {
    path: '/cart',
    element: <Navigate to="/customer/cart" replace />
  },
  {
    path: '/orders',
    element: <Navigate to="/customer/orders" replace />
  },
  {
    path: '/payment',
    element: <Navigate to="/customer/payment" replace />
  },
  {
    path: '/location',
    element: <Navigate to="/customer/location" replace />
  },
  
  // 404 route
  {
    path: '*',
    element: <NotFound />
  }
];

export default routes;
