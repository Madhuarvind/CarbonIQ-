'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import {
  ShoppingBag,
  Leaf,
  Truck,
  Recycle,
  Star,
  Heart,
  ShoppingCart,
  Filter,
  Search,
  TrendingUp,
  Award,
  Zap,
  Package,
  DollarSign
} from 'lucide-react';

// Mock sustainable products data
const sustainableProducts = [
  {
    id: 1,
    name: "Organic Cotton T-Shirt",
    brand: "EcoWear",
    category: "Clothing",
    price: 29.99,
    originalPrice: 39.99,
    carbonFootprint: 2.3,
    savings: 1.2,
    rating: 4.5,
    reviews: 128,
    image: "👕",
    ecoFeatures: ["Organic Cotton", "Fair Trade", "Carbon Neutral Shipping"],
    sustainability: 95,
    inStock: true
  },
  {
    id: 2,
    name: "Bamboo Toothbrush Set",
    brand: "GreenSmile",
    category: "Personal Care",
    price: 12.99,
    originalPrice: 15.99,
    carbonFootprint: 0.8,
    savings: 0.5,
    rating: 4.7,
    reviews: 89,
    image: "🪥",
    ecoFeatures: ["Bamboo Material", "Biodegradable", "Plastic-Free"],
    sustainability: 98,
    inStock: true
  },
  {
    id: 3,
    name: "Solar-Powered Charger",
    brand: "SunCharge",
    category: "Electronics",
    price: 49.99,
    originalPrice: 69.99,
    carbonFootprint: 5.2,
    savings: 3.1,
    rating: 4.3,
    reviews: 67,
    image: "🔋",
    ecoFeatures: ["Solar Powered", "Recycled Materials", "Energy Efficient"],
    sustainability: 88,
    inStock: true
  },
  {
    id: 4,
    name: "Reusable Produce Bags",
    brand: "ZeroWaste",
    category: "Home & Kitchen",
    price: 16.99,
    originalPrice: 19.99,
    carbonFootprint: 1.1,
    savings: 0.7,
    rating: 4.8,
    reviews: 203,
    image: "🛍️",
    ecoFeatures: ["Organic Cotton", "Machine Washable", "Long-lasting"],
    sustainability: 96,
    inStock: true
  },
  {
    id: 5,
    name: "Plant-Based Protein Powder",
    brand: "NatureFuel",
    category: "Health & Nutrition",
    price: 34.99,
    originalPrice: 44.99,
    carbonFootprint: 3.8,
    savings: 2.4,
    rating: 4.6,
    reviews: 156,
    image: "🥦",
    ecoFeatures: ["Plant-Based", "Organic", "Sustainable Packaging"],
    sustainability: 92,
    inStock: false
  },
  {
    id: 6,
    name: "Recycled Ocean Plastic Bottle",
    brand: "AquaPure",
    category: "Home & Kitchen",
    price: 24.99,
    originalPrice: 29.99,
    carbonFootprint: 2.9,
    savings: 1.8,
    rating: 4.4,
    reviews: 94,
    image: "🏺",
    ecoFeatures: ["Recycled Ocean Plastic", "BPA-Free", "Insulated"],
    sustainability: 90,
    inStock: true
  }
];

// Mock conventional alternatives for comparison
const conventionalAlternatives = {
  1: { name: "Regular Cotton T-Shirt", carbonFootprint: 8.7, price: 19.99 },
  2: { name: "Plastic Toothbrush", carbonFootprint: 3.2, price: 8.99 },
  3: { name: "Standard Charger", carbonFootprint: 12.8, price: 39.99 },
  4: { name: "Plastic Shopping Bags", carbonFootprint: 4.5, price: 5.99 },
  5: { name: "Whey Protein Powder", carbonFootprint: 9.3, price: 29.99 },
  6: { name: "Plastic Water Bottle", carbonFootprint: 6.1, price: 14.99 }
};

export default function EcoCommerceIntegration() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [showComparison, setShowComparison] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const categories = ['All', ...new Set(sustainableProducts.map(p => p.category))];

  const filteredProducts = sustainableProducts.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const toggleFavorite = (productId) => {
    setFavorites(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const getTotalSavings = () => {
    return cart.reduce((total, item) => total + (item.savings * item.quantity), 0);
  };

  const getTotalCarbonSavings = () => {
    return cart.reduce((total, item) => {
      const conventional = conventionalAlternatives[item.id];
      const conventionalFootprint = conventional ? conventional.carbonFootprint : item.carbonFootprint * 2;
      return total + ((conventionalFootprint - item.carbonFootprint) * item.quantity);
    }, 0);
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <Card className='bg-slate-800/50 backdrop-blur-sm border border-slate-700'>
        <CardHeader>
          <CardTitle className='text-white flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <ShoppingBag className='w-6 h-6 text-green-400' />
              Sustainable Shopping Assistant
            </div>
            <div className='flex items-center gap-4'>
              <div className='text-right'>
                <div className='text-sm text-gray-400'>Carbon Saved</div>
                <div className='text-lg font-bold text-green-400'>{getTotalCarbonSavings().toFixed(1)} kg CO₂</div>
              </div>
              <Button variant='outline' size='sm'>
                <ShoppingCart className='w-4 h-4 mr-2' />
                Cart ({cart.length})
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className='flex flex-col sm:flex-row gap-4 mb-4'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
              <input
                type='text'
                placeholder='Search sustainable products...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500'
              />
            </div>
            <div className='flex gap-2'>
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Impact Summary */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='bg-slate-700/50 p-3 rounded-lg text-center'>
              <Leaf className='w-6 h-6 mx-auto mb-1 text-green-400' />
              <div className='text-sm text-gray-400'>Carbon Saved</div>
              <div className='text-lg font-bold text-green-400'>{getTotalCarbonSavings().toFixed(1)} kg</div>
            </div>
            <div className='bg-slate-700/50 p-3 rounded-lg text-center'>
              <DollarSign className='w-6 h-6 mx-auto mb-1 text-blue-400' />
              <div className='text-sm text-gray-400'>Money Saved</div>
              <div className='text-lg font-bold text-blue-400'>${getTotalSavings().toFixed(2)}</div>
            </div>
            <div className='bg-slate-700/50 p-3 rounded-lg text-center'>
              <Award className='w-6 h-6 mx-auto mb-1 text-purple-400' />
              <div className='text-sm text-gray-400'>Eco Score</div>
              <div className='text-lg font-bold text-purple-400'>95%</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {filteredProducts.map(product => (
          <Card key={product.id} className='bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:border-slate-600 transition-colors'>
            <CardHeader>
              <div className='flex items-start justify-between'>
                <div className='flex items-center gap-3'>
                  <span className='text-3xl'>{product.image}</span>
                  <div>
                    <CardTitle className='text-white text-lg'>{product.name}</CardTitle>
                    <div className='text-sm text-gray-400'>{product.brand}</div>
                  </div>
                </div>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => toggleFavorite(product.id)}
                  className={favorites.includes(product.id) ? 'text-red-400' : 'text-gray-400'}
                >
                  <Heart className={`w-4 h-4 ${favorites.includes(product.id) ? 'fill-current' : ''}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Price and Rating */}
              <div className='flex items-center justify-between mb-3'>
                <div>
                  <div className='flex items-center gap-2'>
                    <span className='text-xl font-bold text-white'>${product.price}</span>
                    <span className='text-sm text-gray-400 line-through'>${product.originalPrice}</span>
                  </div>
                  <div className='flex items-center gap-1'>
                    <Star className='w-4 h-4 text-yellow-400 fill-current' />
                    <span className='text-sm text-white'>{product.rating}</span>
                    <span className='text-sm text-gray-400'>({product.reviews})</span>
                  </div>
                </div>
                <Badge variant={product.inStock ? 'default' : 'secondary'}>
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </Badge>
              </div>

              {/* Carbon Impact */}
              <div className='bg-slate-700/50 p-3 rounded-lg mb-3'>
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-sm text-gray-400'>Carbon Footprint</span>
                  <div className='flex items-center gap-1'>
                    <Leaf className='w-4 h-4 text-green-400' />
                    <span className='text-sm font-medium text-green-400'>
                      {product.carbonFootprint} kg CO₂
                    </span>
                  </div>
                </div>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-gray-400'>vs. conventional</span>
                  <span className='text-red-400'>+{(conventionalAlternatives[product.id]?.carbonFootprint - product.carbonFootprint).toFixed(1)} kg</span>
                </div>
              </div>

              {/* Sustainability Score */}
              <div className='mb-3'>
                <div className='flex items-center justify-between mb-1'>
                  <span className='text-sm text-gray-400'>Sustainability Score</span>
                  <span className='text-sm font-medium text-white'>{product.sustainability}%</span>
                </div>
                <Progress value={product.sustainability} className='h-2' />
              </div>

              {/* Eco Features */}
              <div className='mb-4'>
                <div className='text-sm text-gray-400 mb-2'>Eco Features:</div>
                <div className='flex flex-wrap gap-1'>
                  {product.ecoFeatures.slice(0, 2).map((feature, index) => (
                    <Badge key={index} variant='secondary' className='text-xs'>
                      {feature}
                    </Badge>
                  ))}
                  {product.ecoFeatures.length > 2 && (
                    <Badge variant='secondary' className='text-xs'>
                      +{product.ecoFeatures.length - 2} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className='flex gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setSelectedProduct(product)}
                  className='flex-1'
                >
                  Compare
                </Button>
                <Button
                  className='flex-1 bg-green-600 hover:bg-green-700'
                  onClick={() => addToCart(product)}
                  disabled={!product.inStock}
                >
                  <ShoppingCart className='w-4 h-4 mr-2' />
                  Add to Cart
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Comparison Modal */}
      {selectedProduct && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50'>
          <Card className='bg-slate-800 border border-slate-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto'>
            <CardHeader>
              <div className='flex items-start justify-between'>
                <div className='flex items-center gap-3'>
                  <span className='text-3xl'>{selectedProduct.image}</span>
                  <div>
                    <CardTitle className='text-white text-xl'>Product Comparison</CardTitle>
                    <div className='text-gray-400'>{selectedProduct.name} vs Conventional Alternative</div>
                  </div>
                </div>
                <Button
                  variant='ghost'
                  onClick={() => setSelectedProduct(null)}
                  className='text-gray-400 hover:text-white'
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {/* Sustainable Product */}
                <div className='bg-green-900/20 border border-green-500/30 rounded-lg p-4'>
                  <h3 className='text-green-400 font-medium mb-3'>🌱 Sustainable Choice</h3>
                  <div className='space-y-3'>
                    <div>
                      <div className='text-sm text-gray-400'>Product</div>
                      <div className='text-white font-medium'>{selectedProduct.name}</div>
                    </div>
                    <div>
                      <div className='text-sm text-gray-400'>Price</div>
                      <div className='text-white font-medium'>${selectedProduct.price}</div>
                    </div>
                    <div>
                      <div className='text-sm text-gray-400'>Carbon Footprint</div>
                      <div className='text-green-400 font-medium'>{selectedProduct.carbonFootprint} kg CO₂</div>
                    </div>
                    <div>
                      <div className='text-sm text-gray-400'>Sustainability Score</div>
                      <div className='text-white font-medium'>{selectedProduct.sustainability}%</div>
                    </div>
                  </div>
                </div>

                {/* Conventional Alternative */}
                <div className='bg-red-900/20 border border-red-500/30 rounded-lg p-4'>
                  <h3 className='text-red-400 font-medium mb-3'>🏭 Conventional Alternative</h3>
                  <div className='space-y-3'>
                    <div>
                      <div className='text-sm text-gray-400'>Product</div>
                      <div className='text-white font-medium'>{conventionalAlternatives[selectedProduct.id]?.name}</div>
                    </div>
                    <div>
                      <div className='text-sm text-gray-400'>Price</div>
                      <div className='text-white font-medium'>${conventionalAlternatives[selectedProduct.id]?.price}</div>
                    </div>
                    <div>
                      <div className='text-sm text-gray-400'>Carbon Footprint</div>
                      <div className='text-red-400 font-medium'>{conventionalAlternatives[selectedProduct.id]?.carbonFootprint} kg CO₂</div>
                    </div>
                    <div>
                      <div className='text-sm text-gray-400'>Sustainability Score</div>
                      <div className='text-white font-medium'>45%</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Impact Comparison */}
              <div className='mt-6 bg-slate-700/50 rounded-lg p-4'>
                <h3 className='text-white font-medium mb-3'>Impact Comparison</h3>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-green-400'>
                      -{(conventionalAlternatives[selectedProduct.id]?.carbonFootprint - selectedProduct.carbonFootprint).toFixed(1)} kg
                    </div>
                    <div className='text-sm text-gray-400'>Carbon Saved</div>
                  </div>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-blue-400'>
                      ${(conventionalAlternatives[selectedProduct.id]?.price - selectedProduct.price).toFixed(2)}
                    </div>
                    <div className='text-sm text-gray-400'>Price Difference</div>
                  </div>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-purple-400'>
                      +{selectedProduct.sustainability - 45}%
                    </div>
                    <div className='text-sm text-gray-400'>Better Sustainability</div>
                  </div>
                </div>
              </div>

              <div className='flex gap-3 mt-6'>
                <Button
                  className='flex-1 bg-green-600 hover:bg-green-700'
                  onClick={() => {
                    addToCart(selectedProduct);
                    setSelectedProduct(null);
                  }}
                >
                  Choose Sustainable Option
                </Button>
                <Button
                  variant='outline'
                  onClick={() => setSelectedProduct(null)}
                  className='flex-1'
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
