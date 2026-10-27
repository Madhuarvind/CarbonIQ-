export const dynamic = "force-static";

import { NextResponse } from 'next/server';

// Mock environmental data - in production, integrate with real APIs
const mockEnvironmentalData = {
  airQuality: {
    index: 45,
    category: 'Good',
    pollutants: {
      pm25: 12,
      pm10: 25,
      no2: 18,
      o3: 35,
      so2: 5
    }
  },
  weather: {
    temperature: 22,
    humidity: 65,
    windSpeed: 12,
    conditions: 'Partly Cloudy',
    uvIndex: 6
  },
  carbonCorrelation: {
    localOffset: 2.3, // kg CO2 offset by local trees/plants
    communityAverage: 8.7,
    weatherImpact: 'moderate' // how weather affects carbon calculations
  },
  recommendations: [
    'Consider walking instead of driving due to good air quality',
    'Current temperature supports energy-efficient cooling',
    'Local air quality supports outdoor activities'
  ]
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const city = searchParams.get('city') || 'Default City';

    // In production, fetch real data from APIs like:
    // - OpenWeatherMap for weather
    // - Air Quality APIs (WAQI, AirNow)
    // - Local environmental databases

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Add some randomization for demo purposes
    const data = {
      ...mockEnvironmentalData,
      location: {
        city: city,
        coordinates: { lat: lat || 40.7128, lng: lng || -74.0060 }
      },
      timestamp: new Date().toISOString(),
      airQuality: {
        ...mockEnvironmentalData.airQuality,
        index: Math.floor(Math.random() * 100) + 20 // Randomize for demo
      },
      weather: {
        ...mockEnvironmentalData.weather,
        temperature: Math.floor(Math.random() * 15) + 15 // 15-30°C range
      }
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error('Environmental data error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch environmental data' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { clerkId, location, emissions } = body;

    // Store location-based emissions data for correlation analysis
    // In production, this would update user environmental impact tracking

    return NextResponse.json({
      success: true,
      message: 'Location data recorded',
      environmentalInsights: {
        localImpact: 'Your emissions contribute to local air quality',
        communityEffect: 'Part of community carbon footprint',
        recommendations: [
          'Consider local public transport options',
          'Support local green initiatives',
          'Monitor air quality before outdoor activities'
        ]
      }
    });
  } catch (error) {
    console.error('Location tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to record location data' },
      { status: 500 }
    );
  }
}
