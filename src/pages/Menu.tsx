
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { mockFoodItems, getFoodByCategory } from '@/data/mockData';
import FoodCard from '@/components/FoodCard';
import CategoryFilter from '@/components/CategoryFilter';
import { useCart } from '@/context/CartContext';
import { Skeleton } from '@/components/ui/skeleton';

const Menu: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [filteredItems, setFilteredItems] = useState(mockFoodItems);
  const [isLoading, setIsLoading] = useState(true);
  const { loading: cartLoading } = useCart();
  
  const categories = ['All', 'Veg', 'Non-Veg', 'Beverage'];

  useEffect(() => {
    // Update the URL when category changes
    if (selectedCategory !== 'All') {
      setSearchParams({ category: selectedCategory });
    } else {
      setSearchParams({});
    }
    
    // Filter food items based on selected category
    setIsLoading(true);
    
    // Simulate network request with minimal delay
    const timer = setTimeout(() => {
      setFilteredItems(getFoodByCategory(selectedCategory));
      setIsLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [selectedCategory, setSearchParams]);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };

  const renderFoodCardSkeleton = () => (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
      <Skeleton className="w-full h-48" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="flex justify-between items-center mt-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 mb-16 md:mb-0">
      <h1 className="text-3xl font-bold mb-8">Food Menu</h1>
      
      <CategoryFilter 
        categories={categories}
        activeCategory={selectedCategory}
        onSelectCategory={handleCategorySelect}
      />
      
      {isLoading || cartLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item}>
              {renderFoodCardSkeleton()}
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((foodItem) => (
              <FoodCard key={foodItem.id} foodItem={foodItem} />
            ))}
          </div>
          
          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No items found in this category.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Menu;
