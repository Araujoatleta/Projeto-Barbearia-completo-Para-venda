import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Star } from 'lucide-react';

const Products = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-12">
        Premium <span className="text-[#c4a47c]">Products</span>
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <div key={product.id} className="card-luxury">
            <div className="relative">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover rounded-t-md"
              />
              <div className="absolute top-4 right-4 bg-[#c4a47c] text-white px-3 py-1 rounded-full">
                ${product.price}
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">{product.name}</h3>
              <p className="text-gray-400 mb-4">{product.description}</p>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-[#c4a47c]" />
                  <span>{product.rating}/5</span>
                </div>
                <span className="text-sm text-gray-400">{product.points} points</span>
              </div>
              <button className="btn-primary w-full flex items-center justify-center space-x-2">
                <ShoppingBag className="h-5 w-5" />
                <span>Add to Cart</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const products = [
  {
    id: 1,
    name: "Premium Beard Oil",
    description: "Luxurious beard oil for a soft and manageable beard",
    price: 29.99,
    rating: 4.8,
    points: 30,
    image: "https://images.unsplash.com/photo-1621607512022-6aecc4fed814?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: 2,
    name: "Styling Pomade",
    description: "Professional-grade pomade for perfect hold and shine",
    price: 24.99,
    rating: 4.7,
    points: 25,
    image: "https://images.unsplash.com/photo-1621607512022-6aecc4fed814?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: 3,
    name: "Luxury Shampoo",
    description: "Premium shampoo for a salon-quality wash",
    price: 34.99,
    rating: 4.9,
    points: 35,
    image: "https://images.unsplash.com/photo-1621607512022-6aecc4fed814?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
  }
];

export default Products;