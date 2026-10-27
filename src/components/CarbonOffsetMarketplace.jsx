'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import {
  Leaf,
  TreePine,
  Wind,
  Sun,
  Droplets,
  Mountain,
  Award,
  ShoppingCart,
  CheckCircle,
  Clock,
  MapPin,
  Users,
  DollarSign,
  TrendingUp
} from 'lucide-react';

// Mock carbon offset projects data
const offsetProjects = [
  {
    id: 1,
    title: "Amazon Rainforest Protection",
    description: "Protecting 10,000 hectares of pristine rainforest in Brazil",
    category: "Forestry",
    location: "Brazil",
    pricePerTon: 25,
    totalTons: 50000,
    soldTons: 12500,
    impact: "High",
    verification: "Verified by Gold Standard",
    image: "🌳",
    benefits: ["Biodiversity Protection", "Indigenous Communities", "Carbon Sequestration"],
    rating: 4.8,
    reviews: 234
  },
  {
    id: 2,
    title: "Solar Farm Development",
    description: "Building 50MW solar farm in California desert",
    category: "Renewable Energy",
    location: "California, USA",
    pricePerTon: 18,
    totalTons: 75000,
    soldTons: 32000,
    impact: "High",
    verification: "Verified by VCS",
    image: "☀️",
    benefits: ["Clean Energy", "Job Creation", "Grid Stability"],
    rating: 4.9,
    reviews: 189
  },
  {
    id: 3,
    title: "Wind Turbine Installation",
    description: "Installing 100 wind turbines in offshore wind farm",
    category: "Renewable Energy",
    location: "North Sea, UK",
    pricePerTon: 22,
    totalTons: 100000,
    soldTons: 45000,
    impact: "High",
    verification: "Verified by Gold Standard",
    image: "💨",
    benefits: ["Renewable Energy", "Marine Protection", "Economic Growth"],
    rating: 4.7,
    reviews: 156
  },
  {
    id: 4,
    title: "Mangrove Restoration",
    description: "Restoring 5,000 hectares of mangrove forests in Indonesia",
    category: "Forestry",
    location: "Indonesia",
    pricePerTon: 30,
    totalTons: 25000,
    soldTons: 8000,
    impact: "High",
    verification: "Verified by Plan Vivo",
    image: "🌿",
    benefits: ["Coastal Protection", "Biodiversity", "Fisheries Support"],
    rating: 4.6,
    reviews: 98
  },
  {
    id: 5,
    title: "Reforestation Project",
    description: "Planting 1 million trees in degraded landscapes",
    category: "Forestry",
    location: "Kenya",
    pricePerTon: 15,
    totalTons: 30000,
    soldTons: 12000,
    impact: "Medium",
    verification: "Verified by VCS",
    image: "🌲",
    benefits: ["Soil Conservation", "Water Management", "Community Development"],
    rating: 4.5,
    reviews: 312
  },
  {
    id: 6,
    title: "Methane Capture Initiative",
    description: "Capturing methane from landfill sites",
    category: "Waste Management",
    location: "Multiple Locations",
    pricePerTon: 12,
    totalTons: 40000,
    soldTons: 18000,
    impact: "High",
    verification: "Verified by Gold Standard",
    image: "🏭",
    benefits: ["Air Quality", "Climate Change Mitigation", "Waste Reduction"],
    rating: 4.4,
    reviews: 87
  }
];

const getCategoryIcon = (category) => {
  switch (category) {
    case 'Forestry': return <TreePine className='w-5 h-5' />;
    case 'Renewable Energy': return <Sun className='w-5 h-5' />;
    case 'Waste Management': return <Mountain className='w-5 h-5' />;
    default: return <Leaf className='w-5 h-5' />;
  }
};

const getImpactColor = (impact) => {
  switch (impact) {
    case 'High': return 'text-green-400';
    case 'Medium': return 'text-yellow-400';
    case 'Low': return 'text-red-400';
    default: return 'text-gray-400';
  }
};

export default function CarbonOffsetMarketplace() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProject, setSelectedProject] = useState(null);
  const [cart, setCart] = useState([]);
  const [userOffsets, setUserOffsets] = useState(0);

  const categories = ['All', ...new Set(offsetProjects.map(p => p.category))];

  const filteredProjects = selectedCategory === 'All'
    ? offsetProjects
    : offsetProjects.filter(p => p.category === selectedCategory);

  const addToCart = (project, tons) => {
    const existingItem = cart.find(item => item.id === project.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === project.id
          ? { ...item, tons: item.tons + tons }
          : item
      ));
    } else {
      setCart([...cart, { ...project, tons }]);
    }
  };

  const removeFromCart = (projectId) => {
    setCart(cart.filter(item => item.id !== projectId));
  };

  const getTotalCost = () => {
    return cart.reduce((total, item) => total + (item.pricePerTon * item.tons), 0);
  };

  const getTotalTons = () => {
    return cart.reduce((total, item) => total + item.tons, 0);
  };

  const purchaseOffsets = async () => {
    // Mock purchase functionality
    alert(`Purchased ${getTotalTons()} tons of carbon offsets for $${getTotalCost()}`);
    setUserOffsets(prev => prev + getTotalTons());
    setCart([]);
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <Card className='bg-slate-800/50 backdrop-blur-sm border border-slate-700'>
        <CardHeader>
          <CardTitle className='text-white flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Leaf className='w-6 h-6 text-green-400' />
              Carbon Offset Marketplace
            </div>
            <div className='flex items-center gap-4'>
              <div className='text-right'>
                <div className='text-sm text-gray-400'>Your Offsets</div>
                <div className='text-lg font-bold text-green-400'>{userOffsets} tons</div>
              </div>
              <Button variant='outline' size='sm'>
                <Award className='w-4 h-4 mr-2' />
                Certificates
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex flex-wrap gap-2 mb-4'>
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

          {/* Cart Summary */}
          {cart.length > 0 && (
            <div className='bg-slate-700/50 rounded-lg p-4'>
              <div className='flex items-center justify-between mb-2'>
                <h3 className='text-white font-medium'>Cart Summary</h3>
                <Button onClick={purchaseOffsets} className='bg-green-600 hover:bg-green-700'>
                  <ShoppingCart className='w-4 h-4 mr-2' />
                  Purchase ({getTotalTons()} tons - ${getTotalCost()})
                </Button>
              </div>
              <div className='space-y-2'>
                {cart.map(item => (
                  <div key={item.id} className='flex items-center justify-between text-sm'>
                    <span className='text-gray-300'>{item.title}</span>
                    <div className='flex items-center gap-2'>
                      <span className='text-white'>{item.tons} tons</span>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => removeFromCart(item.id)}
                        className='text-red-400 hover:text-red-300'
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Projects Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {filteredProjects.map(project => (
          <Card key={project.id} className='bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:border-slate-600 transition-colors'>
            <CardHeader>
              <div className='flex items-start justify-between'>
                <div className='flex items-center gap-2'>
                  <span className='text-2xl'>{project.image}</span>
                  <div>
                    <CardTitle className='text-white text-lg'>{project.title}</CardTitle>
                    <div className='flex items-center gap-2 mt-1'>
                      {getCategoryIcon(project.category)}
                      <span className='text-sm text-gray-400'>{project.category}</span>
                    </div>
                  </div>
                </div>
                <Badge variant='outline' className={getImpactColor(project.impact)}>
                  {project.impact} Impact
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className='text-gray-300 text-sm mb-4'>{project.description}</p>

              {/* Project Stats */}
              <div className='space-y-3 mb-4'>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-gray-400'>Progress</span>
                  <span className='text-white'>{project.soldTons}/{project.totalTons} tons</span>
                </div>
                <Progress value={(project.soldTons / project.totalTons) * 100} className='h-2' />

                <div className='grid grid-cols-2 gap-4 text-sm'>
                  <div>
                    <div className='text-gray-400'>Price per ton</div>
                    <div className='text-white font-medium'>${project.pricePerTon}</div>
                  </div>
                  <div>
                    <div className='text-gray-400'>Available</div>
                    <div className='text-white font-medium'>{project.totalTons - project.soldTons} tons</div>
                  </div>
                </div>

                <div className='flex items-center gap-2 text-sm'>
                  <MapPin className='w-4 h-4 text-gray-400' />
                  <span className='text-gray-300'>{project.location}</span>
                </div>

                <div className='flex items-center gap-2 text-sm'>
                  <CheckCircle className='w-4 h-4 text-green-400' />
                  <span className='text-gray-300'>{project.verification}</span>
                </div>
              </div>

              {/* Benefits */}
              <div className='mb-4'>
                <div className='text-sm text-gray-400 mb-2'>Key Benefits:</div>
                <div className='flex flex-wrap gap-1'>
                  {project.benefits.map((benefit, index) => (
                    <Badge key={index} variant='secondary' className='text-xs'>
                      {benefit}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div className='flex items-center justify-between mb-4'>
                <div className='flex items-center gap-1'>
                  <span className='text-yellow-400'>★</span>
                  <span className='text-white text-sm'>{project.rating}</span>
                  <span className='text-gray-400 text-sm'>({project.reviews})</span>
                </div>
              </div>

              {/* Purchase Options */}
              <div className='space-y-2'>
                <div className='flex gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => addToCart(project, 1)}
                    className='flex-1'
                  >
                    +1 ton
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => addToCart(project, 5)}
                    className='flex-1'
                  >
                    +5 tons
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => addToCart(project, 10)}
                    className='flex-1'
                  >
                    +10 tons
                  </Button>
                </div>
                <Button
                  className='w-full bg-green-600 hover:bg-green-700'
                  onClick={() => setSelectedProject(project)}
                >
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Project Detail Modal would go here */}
      {selectedProject && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50'>
          <Card className='bg-slate-800 border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
            <CardHeader>
              <div className='flex items-start justify-between'>
                <div className='flex items-center gap-3'>
                  <span className='text-3xl'>{selectedProject.image}</span>
                  <div>
                    <CardTitle className='text-white text-xl'>{selectedProject.title}</CardTitle>
                    <div className='flex items-center gap-2 mt-1'>
                      {getCategoryIcon(selectedProject.category)}
                      <span className='text-gray-400'>{selectedProject.category}</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant='ghost'
                  onClick={() => setSelectedProject(null)}
                  className='text-gray-400 hover:text-white'
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className='text-gray-300 mb-4'>{selectedProject.description}</p>

              {/* Detailed stats */}
              <div className='grid grid-cols-2 gap-4 mb-4'>
                <div className='bg-slate-700/50 p-3 rounded-lg'>
                  <div className='text-sm text-gray-400'>Price per ton</div>
                  <div className='text-2xl font-bold text-white'>${selectedProject.pricePerTon}</div>
                </div>
                <div className='bg-slate-700/50 p-3 rounded-lg'>
                  <div className='text-sm text-gray-400'>Available tons</div>
                  <div className='text-2xl font-bold text-white'>{selectedProject.totalTons - selectedProject.soldTons}</div>
                </div>
              </div>

              <Button
                className='w-full bg-green-600 hover:bg-green-700 mb-4'
                onClick={() => {
                  addToCart(selectedProject, 1);
                  setSelectedProject(null);
                }}
              >
                Add to Cart
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
