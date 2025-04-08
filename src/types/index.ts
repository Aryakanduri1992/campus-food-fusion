
// Food item types
export type FoodCategory = 'Veg' | 'Non-Veg' | 'Beverage';

export interface FoodItem {
  id: number;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  category: FoodCategory;
}

// Cart types
export interface CartItem {
  foodItem: FoodItem;
  quantity: number;
}

// Order types
export type OrderStatus = 'Placed' | 'In Process' | 'Delivered';

export interface Order {
  id: string;
  items: CartItem[];
  totalPrice: number;
  status: OrderStatus;
  timestamp: string;
}

// User role type
export type UserRole = 'customer' | 'delivery_partner' | 'owner';

// Database types for type safety when working with Supabase
export interface DbCartItem {
  id: string;
  cart_id: string;
  food_item_id: number;
  food_name: string;
  food_price: number;
  food_image_url: string;
  quantity: number;
  created_at: string;
}

export interface DbOrder {
  id: string;
  user_id: string;
  status: string;
  total_price: number;
  created_at: string;
}

export interface DbOrderItem {
  id: string;
  order_id: string;
  food_item_id: number;
  food_name: string;
  food_price: number;
  food_image_url: string;
  quantity: number;
  created_at: string;
}

// User roles table type
export interface DbUserRole {
  id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
}

// Delivery partner type
export interface DeliveryPartner {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: 'Available' | 'Busy';
}

// Type safety for all database tables
export type Database = {
  public: {
    Tables: {
      carts: {
        Row: {
          id: string;
          user_id: string;
          created_at: string;
        };
      };
      cart_items: {
        Row: {
          id: string;
          cart_id: string;
          food_item_id: number;
          food_name: string;
          food_price: number;
          food_image_url: string;
          quantity: number;
          created_at: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          status: string;
          total_price: number;
          created_at: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          food_item_id: number;
          food_name: string;
          food_price: number;
          food_image_url: string;
          quantity: number;
          created_at: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          created_at: string;
          first_name: string | null;
          last_name: string | null;
          phone_number: string | null;
          updated_at: string;
        };
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: UserRole;
          created_at: string;
        };
      };
    };
  };
};

