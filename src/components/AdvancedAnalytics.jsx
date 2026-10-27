'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  BarChart3,
  TrendingUp,
  Users,
  Target,
  Award,
  Calendar,
  Filter,
  Download,
  Share,
  Brain,
  Zap
} from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

// Mock data for peer comparisons
const peerComparisonData = [
  { group: '18-25', average: 12.5, user: 8.2, percentile: 25 },
  { group: '26-35', average: 15.8, user: 8.2, percentile: 15 },
  { group: '36-45', average: 18.2, user: 8.2, percentile: 10 },
  { group: '46-55', average: 16.9, user: 8.2, percentile: 20 },
  { group: '55+', average: 14.3, user: 8.2, percentile: 30 }
];

const industryBenchmarks = [
  { industry: 'Technology', average: 22.1, user: 8.2, status: 'excellent' },
  { industry: 'Finance', average: 18.5, user: 8.2, status: 'excellent' },
  { industry: 'Healthcare', average: 15.2, user: 8.2, status: 'good' },
  { industry: 'Education', average: 12.8, user: 8.2, status: 'good' },
  { industry: 'Retail', average: 25.3, user: 8.2, status: 'excellent' }
];

const lifestyleComparison = [
  { category: 'Urban', average: 18.5, user: 8.2, difference: -10.3 },
  { category: 'Suburban', average: 14.2, user: 8.2, difference: -6.0 },
  { category: 'Rural', average: 9.8, user: 8.2, difference: -1.6 },
  { category: 'Remote', average: 6.5, user: 8.2, difference: 1.7 }
];

const historicalTrends = [
  { month: 'Jan', user: 10.2, peer: 15.8, industry: 22.1 },
  { month: 'Feb', user: 9.8, peer: 16.2, industry: 21.8 },
  { month: 'Mar', user: 8.9, peer: 15.9, industry: 22.3 },
  { month: 'Apr', user: 8.5, peer: 16.1, industry: 21.9 },
  { month: 'May', user: 8.2, peer: 15.7, industry: 22.2 },
  { month: 'Jun', user: 7.9, peer: 16.0, industry: 21.7 }
];

const aiInsights = [
  {
    type: 'opportunity',
    title: 'Transportation Optimization',
    description: 'Switching to electric vehicle could reduce emissions by 35%',
    impact: 'high',
    savings: 2.8
  },
  {
    type: 'trend',
    title: 'Seasonal Pattern Detected',
    description: 'Your emissions peak during winter months due to heating',
    impact: 'medium',
    savings: 1.2
  },
  {
    type: 'comparison',
    title: 'Peer Performance',
    description: 'You\'re in the top 15% of your age group',
    impact: 'positive',
    savings: 0
  },
  {
    type: 'goal',
    title: 'Achievement Unlocked',
    description: 'Reached 20% reduction milestone',
    impact: 'achievement',
    savings: 0
  }
];

export default function AdvancedAnalytics() {
  const { user } = useUser();
  const [selectedComparison, setSelectedComparison] = useState('age');
  const [selectedTimeframe, setSelectedTimeframe] = useState('6months');
  const [loading, setLoading] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'text-green-400';
      case 'good': return 'text-blue-400';
      case 'average': return 'text-yellow-400';
      case 'poor': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'positive': return 'bg-green-500';
      case 'achievement': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const exportData = () => {
    // Mock export functionality
    console.log('Exporting analytics data...');
  };

  const shareInsights = () => {
    // Mock share functionality
    console.log('Sharing insights...');
  };

  return (
    <div className='space-y-6'>
      {/* Controls */}
      <Card className='bg-slate-800/50 backdrop-blur-sm border border-slate-700'>
        <CardHeader>
          <CardTitle className='text-white flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <BarChart3 className='w-5 h-5' />
              Advanced Comparative Analytics
            </div>
            <div className='flex gap-2'>
              <Button variant='outline' size='sm' onClick={exportData}>
                <Download className='w-4 h-4 mr-2' />
                Export
              </Button>
              <Button variant='outline' size='sm' onClick={shareInsights}>
                <Share className='w-4 h-4 mr-2' />
                Share
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex flex-wrap gap-4'>
            <div className='flex items-center gap-2'>
              <Filter className='w-4 h-4 text-gray-400' />
              <Select value={selectedComparison} onValueChange={setSelectedComparison}>
                <SelectTrigger className='w-40'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='age'>By Age Group</SelectItem>
                  <SelectItem value='industry'>By Industry</SelectItem>
                  <SelectItem value='lifestyle'>By Lifestyle</SelectItem>
                  <SelectItem value='location'>By Location</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='flex items-center gap-2'>
              <Calendar className='w-4 h-4 text-gray-400' />
              <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                <SelectTrigger className='w-40'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='1month'>Last Month</SelectItem>
                  <SelectItem value='3months'>Last 3 Months</SelectItem>
                  <SelectItem value='6months'>Last 6 Months</SelectItem>
                  <SelectItem value='1year'>Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card className='bg-slate-800/50 backdrop-blur-sm border border-slate-700'>
        <CardHeader>
          <CardTitle className='text-white flex items-center gap-2'>
            <Brain className='w-5 h-5' />
            AI-Powered Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {aiInsights.map((insight, index) => (
              <div
                key={index}
                className='bg-slate-700/50 border border-slate-600 rounded-lg p-4'
              >
                <div className='flex items-start justify-between mb-2'>
                  <div className='flex items-center gap-2'>
                    <div className={`w-3 h-3 rounded-full ${getImpactColor(insight.impact)}`}></div>
                    <h4 className='text-white font-medium'>{insight.title}</h4>
                  </div>
                  {insight.savings > 0 && (
                    <Badge variant='outline' className='text-green-400 border-green-400'>
                      -{insight.savings} MT CO₂
                    </Badge>
                  )}
                </div>
                <p className='text-gray-300 text-sm'>{insight.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Peer Comparison Charts */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Age Group Comparison */}
        <Card className='bg-slate-800/50 backdrop-blur-sm border border-slate-700'>
          <CardHeader>
            <CardTitle className='text-white flex items-center gap-2'>
              <Users className='w-5 h-5' />
              Age Group Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width='100%' height={300}>
              <BarChart data={peerComparisonData}>
                <CartesianGrid strokeDasharray='3 3' stroke='#374151' />
                <XAxis dataKey='group' stroke='#9CA3AF' />
                <YAxis stroke='#9CA3AF' />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey='average' fill='#3B82F6' name='Group Average' />
                <Bar dataKey='user' fill='#10B981' name='Your Emissions' />
              </BarChart>
            </ResponsiveContainer>
            <div className='mt-4 text-center'>
              <Badge variant='outline' className='text-green-400 border-green-400'>
                Top 15% in your age group
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Industry Benchmarks */}
        <Card className='bg-slate-800/50 backdrop-blur-sm border border-slate-700'>
          <CardHeader>
            <CardTitle className='text-white flex items-center gap-2'>
              <Target className='w-5 h-5' />
              Industry Benchmarks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {industryBenchmarks.map((item, index) => (
                <div key={index} className='flex items-center justify-between'>
                  <div className='flex-1'>
                    <div className='flex items-center justify-between mb-1'>
                      <span className='text-white text-sm'>{item.industry}</span>
                      <span className={`text-sm font-medium ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                    <Progress
                      value={(item.user / item.average) * 100}
                      className='h-2'
                    />
                    <div className='flex justify-between text-xs text-gray-400 mt-1'>
                      <span>You: {item.user} MT</span>
                      <span>Avg: {item.average} MT</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Historical Trends */}
      <Card className='bg-slate-800/50 backdrop-blur-sm border border-slate-700'>
        <CardHeader>
          <CardTitle className='text-white flex items-center gap-2'>
            <TrendingUp className='w-5 h-5' />
            Historical Trend Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width='100%' height={400}>
            <LineChart data={historicalTrends}>
              <CartesianGrid strokeDasharray='3 3' stroke='#374151' />
              <XAxis dataKey='month' stroke='#9CA3AF' />
              <YAxis stroke='#9CA3AF' />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Line
                type='monotone'
                dataKey='user'
                stroke='#10B981'
                strokeWidth={3}
                name='Your Emissions'
              />
              <Line
                type='monotone'
                dataKey='peer'
                stroke='#3B82F6'
                strokeWidth={2}
                strokeDasharray='5 5'
                name='Peer Average'
              />
              <Line
                type='monotone'
                dataKey='industry'
                stroke='#F59E0B'
                strokeWidth={2}
                strokeDasharray='10 5'
                name='Industry Average'
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Lifestyle Comparison */}
      <Card className='bg-slate-800/50 backdrop-blur-sm border border-slate-700'>
        <CardHeader>
          <CardTitle className='text-white flex items-center gap-2'>
            <Award className='w-5 h-5' />
            Lifestyle Impact Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            {lifestyleComparison.map((item, index) => (
              <div
                key={index}
                className='bg-slate-700/50 border border-slate-600 rounded-lg p-4 text-center'
              >
                <h4 className='text-white font-medium mb-2'>{item.category}</h4>
                <div className='text-2xl font-bold text-emerald-400 mb-1'>
                  {item.difference > 0 ? '+' : ''}{item.difference} MT
                </div>
                <div className='text-sm text-gray-400'>vs. average</div>
                <div className='mt-2'>
                  <Badge
                    variant='outline'
                    className={item.difference <= 0 ? 'text-green-400 border-green-400' : 'text-red-400 border-red-400'}
                  >
                    {item.difference <= 0 ? 'Better' : 'Higher'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
