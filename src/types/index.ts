
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
  id: number;
  items: CartItem[];
  totalPrice: number;
  status: OrderStatus;
  timestamp: string;
}
