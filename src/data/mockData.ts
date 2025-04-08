import { FoodItem, CartItem, Order } from '../types';

// Mock food data
export const mockFoodItems: FoodItem[] = [
  {
    id: 1,
    name: 'Classic Veggie Burger',
    price: 6.99,
    description: 'Delicious veggie patty with fresh lettuce, tomato, and special sauce.',
    imageUrl: 'https://images.unsplash.com/photo-1550317138-10000687a72b?q=80&w=1020&auto=format&fit=crop',
    category: 'Veg',
  },
  {
    id: 2,
    name: 'Paneer Tikka Sandwich',
    price: 5.99,
    description: 'Grilled paneer with spices and vegetables in fresh bread.',
    imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=1173&auto=format&fit=crop',
    category: 'Veg',
  },
  {
    id: 3,
    name: 'Chicken Burger',
    price: 7.99,
    description: 'Grilled chicken patty with lettuce, cheese, and mayo.',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=999&auto=format&fit=crop',
    category: 'Non-Veg',
  },
  {
    id: 4,
    name: 'BBQ Chicken Wings',
    price: 8.99,
    description: 'Spicy BBQ chicken wings with special dipping sauce.',
    imageUrl: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?q=80&w=1080&auto=format&fit=crop',
    category: 'Non-Veg',
  },
  {
    id: 5,
    name: 'Cold Coffee',
    price: 3.99,
    description: 'Refreshing cold coffee with ice cream.',
    imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?q=80&w=1169&auto=format&fit=crop',
    category: 'Beverage',
  },
  {
    id: 6,
    name: 'Fresh Lime Soda',
    price: 2.49,
    description: 'Refreshing lime soda with mint leaves.',
    imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=1074&auto=format&fit=crop',
    category: 'Beverage',
  },
  {
    id: 7,
    name: 'Veg Biryani',
    price: 9.99,
    description: 'Fragrant rice cooked with mixed vegetables and special spices.',
    imageUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=1974&auto=format&fit=crop',
    category: 'Veg',
  },
  {
    id: 8,
    name: 'Chicken Biryani',
    price: 11.99,
    description: 'Aromatic rice dish with marinated chicken and traditional spices.',
    imageUrl: 'https://images.unsplash.com/photo-1633945274405-b6c8069d5bf6?q=80&w=1170&auto=format&fit=crop',
    category: 'Non-Veg',
  },
  {
    id: 9,
    name: 'Mango Lassi',
    price: 3.49,
    description: 'Sweet yogurt drink with mango pulp and a hint of cardamom.',
    imageUrl: 'https://images.unsplash.com/photo-1626201850121-3e5ef0d8defd?q=80&w=987&auto=format&fit=crop',
    category: 'Beverage',
  },
];

// Mock past orders
export const mockOrders: Order[] = [
  {
    id: 1,
    items: [
      {
        foodItem: mockFoodItems[0],
        quantity: 2
      },
      {
        foodItem: mockFoodItems[3],
        quantity: 1
      }
    ],
    totalPrice: 599.0,
    status: 'Delivered' as OrderStatus,
    timestamp: '2023-04-15T14:30:00.000Z'
  },
  {
    id: 2,
    items: [
      {
        foodItem: mockFoodItems[2],
        quantity: 1
      },
      {
        foodItem: mockFoodItems[5],
        quantity: 3
      }
    ],
    totalPrice: 849.5,
    status: 'In Process' as OrderStatus,
    timestamp: '2023-04-16T11:20:00.000Z'
  },
  {
    id: 3,
    items: [
      {
        foodItem: mockFoodItems[1],
        quantity: 2
      }
    ],
    totalPrice: 320.0,
    status: 'Placed' as OrderStatus,
    timestamp: '2023-04-16T18:45:00.000Z'
  }
];

// Get food items by category
export const getFoodByCategory = (category: string) => {
  if (category === 'All') {
    return mockFoodItems;
  }
  return mockFoodItems.filter(item => item.category === category);
};
