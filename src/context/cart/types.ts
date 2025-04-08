
import { FoodItem } from '@/types';

export interface CartState {
  cart: CartItem[];
  loading: boolean;
  cartId: string | null;
}

export interface CartItem {
  foodItem: FoodItem;
  quantity: number;
}

export interface CartContextType {
  cart: CartItem[];
  addToCart: (foodItem: FoodItem) => void;
  removeFromCart: (foodItemId: number) => void;
  updateQuantity: (foodItemId: number, newQuantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  placeOrder: () => Promise<string | null>;
  loading: boolean;
  fetchCart: () => Promise<void>;
}

export type DbCartItem = {
  id: string;
  cart_id: string;
  food_item_id: number;
  food_name: string;
  food_price: number;
  food_image_url: string;
  quantity: number;
  created_at: string;
};
