'use client';
import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sphere, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Globe,
  Zap,
  Cloud,
  TrendingUp,
  RotateCcw,
  Play,
  Pause,
  Info
} from 'lucide-react';

// Carbon cloud data points (simulated)
const carbonClouds = [
  { lat: 40.7128, lng: -74.0060, intensity: 0.8, city: "New York", emissions: 45.2 },
  { lat: 51.5074, lng: -0.1278, intensity: 0.7, city: "London", emissions: 38.1 },
  { lat: 35.6762, lng: 139.6503, intensity: 0.9, city: "Tokyo", emissions: 52.3 },
  { lat: -33.8688, lng: 151.2093, intensity: 0.6, city: "Sydney", emissions: 28.7 },
  { lat: 55.7558, lng: 37.6173, intensity: 0.8, city: "Moscow", emissions: 41.8 },
  { lat: 19.4326, lng: -99.1332, intensity: 0.7, city: "Mexico City", emissions: 35.4 },
  { lat: 28.6139, lng: 77.2090, intensity: 0.8, city: "Delhi", emissions: 48.9 },
  { lat: 39.9042, lng: 116.4074, intensity: 0.9, city: "Beijing", emissions: 55.1 },
  { lat: -23.5505, lng: -46.6333, intensity: 0.6, city: "São Paulo", emissions: 32.1 },
  { lat: 1.3521, lng: 103.8198, intensity: 0.5, city: "Singapore", emissions: 25.8 }
];

// Convert lat/lng to 3D coordinates
function latLngToVector3(lat, lng, radius = 2) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

function CarbonCloud({ position, intensity, city, emissions, onHover, onLeave }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.scale.setScalar(hovered ? 1.2 : 1);
    }
  });

  const handlePointerOver = () => {
    setHovered(true);
    onHover(city, emissions);
  };

  const handlePointerOut = () => {
    setHovered(false);
    onLeave();
  };

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={[0.05 + intensity * 0.1, 16, 16]} />
        <meshStandardMaterial
          color={new THREE.Color().setHSL(0.1, 0.8, 0.3 + intensity * 0.4)}
          emissive={new THREE.Color().setHSL(0.1, 0.5, 0.1)}
          transparent
          opacity={0.7}
        />
      </mesh>
      {/* Connection line to surface */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([0, 0, 0, 0, -0.15, 0])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#ff6b6b" opacity={0.5} transparent />
      </line>
    </group>
  );
}

function Earth() {
  const earthRef = useRef();

  useFrame((state) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.002;
    }
  });

  return (
    <mesh ref={earthRef}>
      <sphereGeometry args={[2, 64, 64]} />
      <meshStandardMaterial
        color="#1a365d"
        roughness={0.8}
        metalness={0.1}
      />
    </mesh>
  );
}

function Scene({ hoveredCity, hoveredEmissions, onHover, onLeave }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />

      <Earth />

      {carbonClouds.map((cloud, index) => (
        <CarbonCloud
          key={index}
          position={latLngToVector3(cloud.lat, cloud.lng)}
          intensity={cloud.intensity}
          city={cloud.city}
          emissions={cloud.emissions}
          onHover={onHover}
          onLeave={onLeave}
        />
      ))}

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={3}
        maxDistance={8}
        autoRotate={true}
        autoRotateSpeed={0.5}
      />
    </>
  );
}

export default function GlobeVisualization() {
  const [hoveredCity, setHoveredCity] = useState(null);
  const [hoveredEmissions, setHoveredEmissions] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedView, setSelectedView] = useState('global');
  const [timeRange, setTimeRange] = useState('current');

  const handleHover = (city, emissions) => {
    setHoveredCity(city);
    setHoveredEmissions(emissions);
  };

  const handleLeave = () => {
    setHoveredCity(null);
    setHoveredEmissions(null);
  };

  const toggleAnimation = () => {
    setIsPlaying(!isPlaying);
  };

  const resetView = () => {
    // Reset camera position
    setSelectedView('global');
  };

  return (
    <div className='space-y-6'>
      {/* Controls */}
      <Card className='bg-slate-800/50 backdrop-blur-sm border border-slate-700'>
        <CardHeader>
          <CardTitle className='text-white flex items-center gap-2'>
            <Globe className='w-5 h-5' />
            Global Carbon Impact Visualization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex flex-wrap gap-3 mb-4'>
            <Button
              variant={selectedView === 'global' ? 'default' : 'outline'}
              size='sm'
              onClick={() => setSelectedView('global')}
            >
              Global View
            </Button>
            <Button
              variant={selectedView === 'regional' ? 'default' : 'outline'}
              size='sm'
              onClick={() => setSelectedView('regional')}
            >
              Regional Focus
            </Button>
            <Button
              variant={timeRange === 'current' ? 'default' : 'outline'}
              size='sm'
              onClick={() => setTimeRange('current')}
            >
              Current
            </Button>
            <Button
              variant={timeRange === 'historical' ? 'default' : 'outline'}
              size='sm'
              onClick={() => setTimeRange('historical')}
            >
              Historical
            </Button>
            <Button variant='outline' size='sm' onClick={toggleAnimation}>
              {isPlaying ? <Pause className='w-4 h-4' /> : <Play className='w-4 h-4' />}
            </Button>
            <Button variant='outline' size='sm' onClick={resetView}>
              <RotateCcw className='w-4 h-4' />
            </Button>
          </div>

          {/* Legend */}
          <div className='flex flex-wrap gap-4 text-sm'>
            <div className='flex items-center gap-2'>
              <div className='w-4 h-4 rounded-full bg-red-500 opacity-70'></div>
              <span className='text-gray-300'>High Emissions</span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='w-4 h-4 rounded-full bg-yellow-500 opacity-70'></div>
              <span className='text-gray-300'>Medium Emissions</span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='w-4 h-4 rounded-full bg-green-500 opacity-70'></div>
              <span className='text-gray-300'>Low Emissions</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3D Globe */}
      <Card className='bg-slate-800/50 backdrop-blur-sm border border-slate-700'>
        <CardContent className='p-0'>
          <div className='relative h-96 w-full'>
            <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
              <Scene
                hoveredCity={hoveredCity}
                hoveredEmissions={hoveredEmissions}
                onHover={handleHover}
                onLeave={handleLeave}
              />
            </Canvas>

            {/* Hover Info */}
            {hoveredCity && (
              <div className='absolute top-4 left-4 bg-slate-900/90 backdrop-blur-sm border border-slate-700 rounded-lg p-3'>
                <h3 className='text-white font-bold'>{hoveredCity}</h3>
                <div className='flex items-center gap-2 mt-1'>
                  <Cloud className='w-4 h-4 text-red-400' />
                  <span className='text-gray-300'>{hoveredEmissions} MT CO₂/year</span>
                </div>
              </div>
            )}

            {/* Info Panel */}
            <div className='absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur-sm border border-slate-700 rounded-lg p-3 max-w-xs'>
              <div className='flex items-center gap-2 mb-2'>
                <Info className='w-4 h-4 text-blue-400' />
                <span className='text-white font-medium'>Global Impact</span>
              </div>
              <p className='text-gray-300 text-sm'>
                Hover over carbon clouds to see city-specific emissions data.
                Each cloud represents CO₂ emissions from major metropolitan areas.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Card className='bg-slate-800/50 backdrop-blur-sm border border-slate-700'>
          <CardContent className='p-4 text-center'>
            <Zap className='w-8 h-8 mx-auto mb-2 text-red-400' />
            <div className='text-2xl font-bold text-white'>411 MT</div>
            <div className='text-sm text-gray-400'>Global CO₂ Emissions</div>
          </CardContent>
        </Card>

        <Card className='bg-slate-800/50 backdrop-blur-sm border border-slate-700'>
          <CardContent className='p-4 text-center'>
            <TrendingUp className='w-8 h-8 mx-auto mb-2 text-yellow-400' />
            <div className='text-2xl font-bold text-white'>+2.3%</div>
            <div className='text-sm text-gray-400'>Year-over-Year Growth</div>
          </CardContent>
        </Card>

        <Card className='bg-slate-800/50 backdrop-blur-sm border border-slate-700'>
          <CardContent className='p-4 text-center'>
            <Globe className='w-8 h-8 mx-auto mb-2 text-green-400' />
            <div className='text-2xl font-bold text-white'>10 Cities</div>
            <div className='text-sm text-gray-400'>Major Contributors</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
