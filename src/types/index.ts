
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
