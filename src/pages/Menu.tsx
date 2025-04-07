
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { mockFoodItems, getFoodByCategory } from '@/data/mockData';
import FoodCard from '@/components/FoodCard';
import CategoryFilter from '@/components/CategoryFilter';

const Menu: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [filteredItems, setFilteredItems] = useState(mockFoodItems);
  
  const categories = ['All', 'Veg', 'Non-Veg', 'Beverage'];

  useEffect(() => {
    // Update the URL when category changes
    if (selectedCategory !== 'All') {
      setSearchParams({ category: selectedCategory });
    } else {
      setSearchParams({});
    }
    
    // Filter food items based on selected category
    setFilteredItems(getFoodByCategory(selectedCategory));
  }, [selectedCategory, setSearchParams]);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };

  return (
    <div className="container mx-auto px-4 py-8 mb-16 md:mb-0">
      <h1 className="text-3xl font-bold mb-8">Food Menu</h1>
      
      <CategoryFilter 
        categories={categories}
        activeCategory={selectedCategory}
        onSelectCategory={handleCategorySelect}
      />
      
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
    </div>
  );
};

export default Menu;
