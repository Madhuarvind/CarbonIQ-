'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Trophy,
  Star,
  Flame,
  Target,
  Users,
  Award,
  Lock,
  CheckCircle,
  Gift,
  TrendingUp
} from 'lucide-react';
import { useUser } from '@clerk/nextjs';

const AchievementSystem = () => {
  const { user } = useUser();
  const [achievements, setAchievements] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showNewAchievements, setShowNewAchievements] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchAchievements();
    }
  }, [user?.id]);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/achievements?clerkId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setAchievements(data);

        // Show celebration for new achievements
        if (data.new && data.new.length > 0) {
          setShowNewAchievements(true);
          setTimeout(() => setShowNewAchievements(false), 5000);
        }
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500';
      case 'uncommon': return 'bg-green-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'milestone': return <Trophy className='w-4 h-4' />;
      case 'streak': return <Flame className='w-4 h-4' />;
      case 'reduction': return <TrendingUp className='w-4 h-4' />;
      case 'habit': return <Target className='w-4 h-4' />;
      case 'social': return <Users className='w-4 h-4' />;
      case 'competition': return <Award className='w-4 h-4' />;
      default: return <Star className='w-4 h-4' />;
    }
  };

  const filteredAchievements = achievements?.allAchievements?.filter(achievement => {
    if (selectedCategory === 'all') return true;
    return achievement.category === selectedCategory;
  }) || [];

  const unlockedIds = achievements?.unlocked?.map(a => a.id) || [];

  if (loading) {
    return (
      <Card className='bg-slate-800/50 backdrop-blur-sm border border-slate-700'>
        <CardContent className='p-6'>
          <div className='flex items-center justify-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400'></div>
            <span className='ml-2 text-gray-400'>Loading achievements...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Achievement Stats */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card className='bg-slate-800/50 backdrop-blur-sm border border-slate-700'>
          <CardContent className='p-4 text-center'>
            <Trophy className='w-8 h-8 mx-auto mb-2 text-yellow-400' />
            <div className='text-2xl font-bold text-white'>{achievements?.stats?.total || 0}</div>
            <div className='text-sm text-gray-400'>Unlocked</div>
          </CardContent>
        </Card>

        <Card className='bg-slate-800/50 backdrop-blur-sm border border-slate-700'>
          <CardContent className='p-4 text-center'>
            <Star className='w-8 h-8 mx-auto mb-2 text-emerald-400' />
            <div className='text-2xl font-bold text-white'>{achievements?.totalPoints || 0}</div>
            <div className='text-sm text-gray-400'>Points</div>
          </CardContent>
        </Card>

        <Card className='bg-slate-800/50 backdrop-blur-sm border border-slate-700'>
          <CardContent className='p-4 text-center'>
            <Flame className='w-8 h-8 mx-auto mb-2 text-orange-400' />
            <div className='text-2xl font-bold text-white'>
              {achievements?.stats?.categories?.streak || 0}
            </div>
            <div className='text-sm text-gray-400'>Streaks</div>
          </CardContent>
        </Card>

        <Card className='bg-slate-800/50 backdrop-blur-sm border border-slate-700'>
          <CardContent className='p-4 text-center'>
            <Award className='w-8 h-8 mx-auto mb-2 text-purple-400' />
            <div className='text-2xl font-bold text-white'>
              {achievements?.stats?.rarities?.legendary || 0}
            </div>
            <div className='text-sm text-gray-400'>Legendary</div>
          </CardContent>
        </Card>
      </div>

      {/* New Achievement Celebration */}
      {showNewAchievements && achievements?.new && achievements.new.length > 0 && (
        <Card className='bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-500/50'>
          <CardContent className='p-6'>
            <div className='flex items-center gap-3'>
              <Gift className='w-8 h-8 text-emerald-400' />
              <div>
                <h3 className='text-lg font-bold text-white'>New Achievement Unlocked!</h3>
                <p className='text-emerald-400'>
                  {achievements.new.length} new achievement{achievements.new.length > 1 ? 's' : ''} earned
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Filter */}
      <Card className='bg-slate-800/50 backdrop-blur-sm border border-slate-700'>
        <CardHeader>
          <CardTitle className='text-white flex items-center gap-2'>
            <Award className='w-5 h-5' />
            Achievement Gallery
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex flex-wrap gap-2 mb-6'>
            {[
              { id: 'all', label: 'All', icon: <Trophy className='w-4 h-4' /> },
              { id: 'milestone', label: 'Milestones', icon: <Trophy className='w-4 h-4' /> },
              { id: 'streak', label: 'Streaks', icon: <Flame className='w-4 h-4' /> },
              { id: 'reduction', label: 'Reduction', icon: <TrendingUp className='w-4 h-4' /> },
              { id: 'habit', label: 'Habits', icon: <Target className='w-4 h-4' /> },
              { id: 'social', label: 'Social', icon: <Users className='w-4 h-4' /> },
              { id: 'competition', label: 'Competition', icon: <Award className='w-4 h-4' /> }
            ].map(category => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                size='sm'
                onClick={() => setSelectedCategory(category.id)}
                className='flex items-center gap-2'
              >
                {category.icon}
                {category.label}
              </Button>
            ))}
          </div>

          {/* Achievement Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {filteredAchievements.map(achievement => {
              const isUnlocked = unlockedIds.includes(achievement.id);
              const isNew = achievements?.new?.includes(achievement.id);

              return (
                <Card
                  key={achievement.id}
                  className={`relative transition-all duration-300 ${
                    isUnlocked
                      ? 'bg-slate-700/50 border-slate-600 shadow-lg'
                      : 'bg-slate-800/30 border-slate-700 opacity-60'
                  } ${isNew ? 'ring-2 ring-emerald-400' : ''}`}
                >
                  {isNew && (
                    <div className='absolute -top-2 -right-2 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full font-bold'>
                      NEW!
                    </div>
                  )}

                  <CardContent className='p-4'>
                    <div className='flex items-start justify-between mb-3'>
                      <div className='text-3xl'>{achievement.icon}</div>
                      <div className='flex items-center gap-2'>
                        <Badge
                          variant='outline'
                          className={`${getRarityColor(achievement.rarity)} text-white border-none text-xs`}
                        >
                          {achievement.rarity}
                        </Badge>
                        {isUnlocked ? (
                          <CheckCircle className='w-5 h-5 text-emerald-400' />
                        ) : (
                          <Lock className='w-5 h-5 text-gray-500' />
                        )}
                      </div>
                    </div>

                    <h3 className={`font-bold mb-2 ${isUnlocked ? 'text-white' : 'text-gray-400'}`}>
                      {achievement.title}
                    </h3>

                    <p className={`text-sm mb-3 ${isUnlocked ? 'text-gray-300' : 'text-gray-500'}`}>
                      {achievement.description}
                    </p>

                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-1 text-sm'>
                        {getCategoryIcon(achievement.category)}
                        <span className='text-gray-400 capitalize'>{achievement.category}</span>
                      </div>
                      <div className='flex items-center gap-1 text-sm font-medium text-emerald-400'>
                        <Star className='w-4 h-4' />
                        {achievement.points} pts
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AchievementSystem;
