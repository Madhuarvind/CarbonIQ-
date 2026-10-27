'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import {
  Thermometer,
  Wind,
  Droplets,
  Cloud,
  MapPin,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';

const EnvironmentalWidget = ({ clerkId }) => {
  const [environmentalData, setEnvironmentalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          // Fallback to default location
          setLocation({ lat: 40.7128, lng: -74.0060 });
        }
      );
    }
  }, []);

  // Fetch environmental data
  const fetchEnvironmentalData = async () => {
    if (!location) return;

    try {
      setLoading(true);
      const response = await fetch(
        `/api/environmental_data?lat=${location.lat}&lng=${location.lng}`
      );

      if (!response.ok) throw new Error('Failed to fetch data');

      const data = await response.json();
      setEnvironmentalData(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (location) {
      fetchEnvironmentalData();
      // Refresh every 30 minutes
      const interval = setInterval(fetchEnvironmentalData, 30 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [location]);

  const getAirQualityColor = (index) => {
    if (index <= 50) return 'bg-green-500';
    if (index <= 100) return 'bg-yellow-500';
    if (index <= 150) return 'bg-orange-500';
    if (index <= 200) return 'bg-red-500';
    return 'bg-purple-500';
  };

  const getAirQualityLabel = (index) => {
    if (index <= 50) return 'Good';
    if (index <= 100) return 'Moderate';
    if (index <= 150) return 'Unhealthy for Sensitive Groups';
    if (index <= 200) return 'Unhealthy';
    return 'Very Unhealthy';
  };

  if (loading) {
    return (
      <Card className='bg-slate-800/50 backdrop-blur-sm border border-slate-700'>
        <CardContent className='p-6'>
          <div className='flex items-center justify-center'>
            <RefreshCw className='w-6 h-6 animate-spin text-emerald-400' />
            <span className='ml-2 text-gray-400'>Loading environmental data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className='bg-slate-800/50 backdrop-blur-sm border border-slate-700'>
        <CardContent className='p-6'>
          <div className='flex items-center text-red-400'>
            <AlertTriangle className='w-5 h-5 mr-2' />
            <span>Unable to load environmental data</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!environmentalData) return null;

  return (
    <div className='space-y-4'>
      {/* Air Quality Card */}
      <Card className='bg-slate-800/50 backdrop-blur-sm border border-slate-700'>
        <CardHeader className='pb-3'>
          <CardTitle className='text-lg text-white flex items-center gap-2'>
            <Cloud className='w-5 h-5 text-blue-400' />
            Air Quality Index
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-3'>
              <div className={`w-12 h-12 rounded-full ${getAirQualityColor(environmentalData.airQuality.index)} flex items-center justify-center text-white font-bold`}>
                {environmentalData.airQuality.index}
              </div>
              <div>
                <p className='text-white font-medium'>{getAirQualityLabel(environmentalData.airQuality.index)}</p>
                <p className='text-sm text-gray-400'>Current AQI</p>
              </div>
            </div>
            <Badge variant='outline' className='text-emerald-400 border-emerald-400'>
              <CheckCircle className='w-3 h-3 mr-1' />
              Real-time
            </Badge>
          </div>

          <div className='grid grid-cols-2 gap-4 text-sm'>
            <div className='bg-slate-700/50 p-3 rounded-lg'>
              <p className='text-gray-400'>PM2.5</p>
              <p className='text-white font-medium'>{environmentalData.airQuality.pollutants.pm25} µg/m³</p>
            </div>
            <div className='bg-slate-700/50 p-3 rounded-lg'>
              <p className='text-gray-400'>PM10</p>
              <p className='text-white font-medium'>{environmentalData.airQuality.pollutants.pm10} µg/m³</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weather Card */}
      <Card className='bg-slate-800/50 backdrop-blur-sm border border-slate-700'>
        <CardHeader className='pb-3'>
          <CardTitle className='text-lg text-white flex items-center gap-2'>
            <Thermometer className='w-5 h-5 text-orange-400' />
            Current Weather
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-3'>
              <div className='text-3xl'>{environmentalData.weather.temperature}°C</div>
              <div>
                <p className='text-white font-medium'>{environmentalData.weather.conditions}</p>
                <p className='text-sm text-gray-400 flex items-center gap-1'>
                  <MapPin className='w-3 h-3' />
                  {environmentalData.location.city}
                </p>
              </div>
            </div>
          </div>

          <div className='grid grid-cols-3 gap-4 text-sm'>
            <div className='bg-slate-700/50 p-3 rounded-lg text-center'>
              <Droplets className='w-4 h-4 mx-auto mb-1 text-blue-400' />
              <p className='text-gray-400'>Humidity</p>
              <p className='text-white font-medium'>{environmentalData.weather.humidity}%</p>
            </div>
            <div className='bg-slate-700/50 p-3 rounded-lg text-center'>
              <Wind className='w-4 h-4 mx-auto mb-1 text-gray-400' />
              <p className='text-gray-400'>Wind</p>
              <p className='text-white font-medium'>{environmentalData.weather.windSpeed} km/h</p>
            </div>
            <div className='bg-slate-700/50 p-3 rounded-lg text-center'>
              <Cloud className='w-4 h-4 mx-auto mb-1 text-yellow-400' />
              <p className='text-gray-400'>UV Index</p>
              <p className='text-white font-medium'>{environmentalData.weather.uvIndex}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Carbon Correlation Card */}
      <Card className='bg-slate-800/50 backdrop-blur-sm border border-slate-700'>
        <CardHeader className='pb-3'>
          <CardTitle className='text-lg text-white flex items-center gap-2'>
            <CheckCircle className='w-5 h-5 text-emerald-400' />
            Local Carbon Impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div className='bg-slate-700/50 p-4 rounded-lg'>
              <p className='text-sm text-gray-400 mb-2'>Local Carbon Offset</p>
              <p className='text-2xl text-emerald-400 font-bold'>
                {environmentalData.carbonCorrelation.localOffset} kg CO₂
              </p>
              <p className='text-xs text-gray-400'>Offset by local vegetation</p>
            </div>

            <div className='space-y-2'>
              <p className='text-sm font-medium text-white'>Smart Recommendations:</p>
              {environmentalData.recommendations.map((rec, index) => (
                <div key={index} className='flex items-start gap-2 text-sm'>
                  <CheckCircle className='w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0' />
                  <span className='text-gray-300'>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnvironmentalWidget;
