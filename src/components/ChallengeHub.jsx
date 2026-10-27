'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import {
  Users,
  Calendar,
  Trophy,
  Target,
  CheckCircle,
  Clock,
  Star,
  TrendingUp,
  Award
} from 'lucide-react';
import { useUser } from '@clerk/nextjs';

const ChallengeHub = () => {
  const { user } = useUser();
  const [challenges, setChallenges] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    if (user?.id) {
      fetchChallenges();
    }
  }, [user?.id]);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/challenges?clerkId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setChallenges(data);
      }
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChallengeAction = async (challengeId, action) => {
    try {
      const response = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clerkId: user.id,
          challengeId,
          action
        })
      });

      if (response.ok) {
        fetchChallenges(); // Refresh data
      }
    } catch (error) {
      console.error('Error updating challenge:', error);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'waste': return '♻️';
      case 'transport': return '🚲';
      case 'food': return '🥗';
      case 'energy': return '⚡';
      default: return '🎯';
    }
  };

  const filteredChallenges = challenges?.challenges?.filter(challenge => {
    if (selectedCategory === 'all') return true;
    return challenge.category === selectedCategory;
  }) || [];

  if (loading) {
    return (
      <Card className='bg-slate-800/50 backdrop-blur-sm border border-slate-700'>
        <CardContent className='p-6'>
          <div className='flex items-center justify-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400'></div>
            <span className='ml-2 text-gray-400'>Loading challenges...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-6'>
      {/* User Stats */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Card className='bg-slate-800/50 backdrop-blur-sm border border-slate-700'>
          <CardContent className='p-4 text-center'>
            <Users className='w-8 h-8 mx-auto mb-2 text-blue-400' />
            <div className='text-2xl font-bold text-white'>
              {challenges?.userStats?.totalParticipating || 0}
            </div>
            <div className='text-sm text-gray-400'>Active Challenges</div>
          </CardContent>
        </Card>

        <Card className='bg-slate-800/50 backdrop-blur-sm border border-slate-700'>
          <CardContent className='p-4 text-center'>
            <CheckCircle className='w-8 h-8 mx-auto mb-2 text-emerald-400' />
            <div className='text-2xl font-bold text-white'>
              {challenges?.userStats?.completedChallenges || 0}
            </div>
            <div className='text-sm text-gray-400'>Completed</div>
          </CardContent>
        </Card>

        <Card className='bg-slate-800/50 backdrop-blur-sm border border-slate-700'>
          <CardContent className='p-4 text-center'>
            <Trophy className='w-8 h-8 mx-auto mb-2 text-yellow-400' />
            <div className='text-2xl font-bold text-white'>
              {challenges?.userStats?.totalPoints || 0}
            </div>
            <div className='text-sm text-gray-400'>Challenge Points</div>
          </CardContent>
        </Card>
      </div>

      {/* Challenge Categories */}
      <Card className='bg-slate-800/50 backdrop-blur-sm border border-slate-700'>
        <CardHeader>
          <CardTitle className='text-white flex items-center gap-2'>
            <Target className='w-5 h-5' />
            Community Challenges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex flex-wrap gap-2 mb-6'>
            {[
              { id: 'all', label: 'All Challenges', icon: '🎯' },
              { id: 'waste', label: 'Waste Reduction', icon: '♻️' },
              { id: 'transport', label: 'Sustainable Transport', icon: '🚲' },
              { id: 'food', label: 'Plant-Based Eating', icon: '🥗' },
              { id: 'energy', label: 'Energy Conservation', icon: '⚡' }
            ].map(category => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                size='sm'
                onClick={() => setSelectedCategory(category.id)}
                className='flex items-center gap-2'
              >
                <span>{category.icon}</span>
                {category.label}
              </Button>
            ))}
          </div>

          {/* Challenge Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {filteredChallenges.map(challenge => (
              <Card
                key={challenge._id || challenge.id}
                className='bg-slate-700/50 border border-slate-600'
              >
                <CardContent className='p-6'>
                  <div className='flex items-start justify-between mb-4'>
                    <div className='flex items-center gap-3'>
                      <div className='text-3xl'>{getCategoryIcon(challenge.category)}</div>
                      <div>
                        <h3 className='text-lg font-bold text-white'>{challenge.title}</h3>
                        <div className='flex items-center gap-2 mt-1'>
                          <Badge
                            variant='outline'
                            className={`${getDifficultyColor(challenge.difficulty)} text-white border-none text-xs`}
                          >
                            {challenge.difficulty}
                          </Badge>
                          <div className='flex items-center gap-1 text-sm text-gray-400'>
                            <Calendar className='w-4 h-4' />
                            {challenge.duration} days
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className='flex items-center gap-1 text-sm font-medium text-emerald-400'>
                      <Star className='w-4 h-4' />
                      {challenge.reward} pts
                    </div>
                  </div>

                  <p className='text-gray-300 mb-4'>{challenge.description}</p>

                  <div className='space-y-4'>
                    {/* Progress Bar */}
                    {challenge.isParticipating && (
                      <div>
                        <div className='flex justify-between text-sm mb-2'>
                          <span className='text-gray-400'>Progress</span>
                          <span className='text-white'>
                            {challenge.userProgress || 0} / {challenge.duration} days
                          </span>
                        </div>
                        <Progress
                          value={(challenge.userProgress || 0) / challenge.duration * 100}
                          className='h-2'
                        />
                      </div>
                    )}

                    {/* Participants */}
                    <div className='flex items-center justify-between text-sm'>
                      <div className='flex items-center gap-2 text-gray-400'>
                        <Users className='w-4 h-4' />
                        {challenge.participants} / {challenge.maxParticipants} participants
                      </div>
                      <div className='flex items-center gap-1'>
                        <Clock className='w-4 h-4 text-blue-400' />
                        <span className='text-blue-400 capitalize'>{challenge.status}</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className='flex gap-2'>
                      {challenge.isParticipating ? (
                        <>
                          <Button
                            className='flex-1 bg-emerald-600 hover:bg-emerald-700'
                            onClick={() => handleChallengeAction(challenge._id || challenge.id, 'update_progress')}
                          >
                            <TrendingUp className='w-4 h-4 mr-2' />
                            Update Progress
                          </Button>
                          <Button
                            variant='outline'
                            onClick={() => handleChallengeAction(challenge._id || challenge.id, 'leave')}
                          >
                            Leave
                          </Button>
                        </>
                      ) : (
                        <Button
                          className='w-full bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600'
                          onClick={() => handleChallengeAction(challenge._id || challenge.id, 'join')}
                          disabled={challenge.participants >= challenge.maxParticipants}
                        >
                          <Award className='w-4 h-4 mr-2' />
                          {challenge.participants >= challenge.maxParticipants ? 'Full' : 'Join Challenge'}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredChallenges.length === 0 && (
            <div className='text-center py-8'>
              <Target className='w-12 h-12 mx-auto mb-4 text-gray-500' />
              <p className='text-gray-400'>No challenges available in this category</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ChallengeHub;
