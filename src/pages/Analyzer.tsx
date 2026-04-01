import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gauge, Activity, Zap, Clock, Route, AlertCircle, TrendingDown, Play, Square, Navigation } from 'lucide-react';
import { Button, Card } from '../components/UI';
import { Button as NeonButton } from '../components/ui/neon-button';
import { StarButton } from '../components/ui/star-button';
import { useTheme } from 'next-themes';
import { calculateFuelWaste } from '../services/ecoService';
import { useApp } from '../context/AppContext';

export function Analyzer() {
  const { addDrivingLog, state } = useApp();
  const { theme } = useTheme();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  // Trip Tracking State
  const [isTracking, setIsTracking] = useState(false);
  const [tripStats, setTripStats] = useState({
    distance: 0,
    currentSpeed: 0,
    avgSpeed: 0,
    maxAcceleration: 0,
    maxBraking: 0,
    duration: 0,
    highAccelCount: 0,
    heavyBrakingCount: 0,
  });
  
  const watchId = useRef<number | null>(null);
  const lastPos = useRef<{ lat: number; lng: number; time: number; speed: number } | null>(null);
  const startTime = useRef<number | null>(null);
  const timerRef = useRef<any>(null);

  const [formData, setFormData] = useState({
    speed: 65,
    braking: 'normal',
    acceleration: 'normal',
    idleTime: 5,
    monthlyKm: 1000,
  });

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const startTrip = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsTracking(true);
    startTime.current = Date.now();
    setTripStats({
      distance: 0,
      currentSpeed: 0,
      avgSpeed: 0,
      maxAcceleration: 0,
      maxBraking: 0,
      duration: 0,
      highAccelCount: 0,
      heavyBrakingCount: 0,
    });

    timerRef.current = setInterval(() => {
      setTripStats(prev => ({ ...prev, duration: Math.floor((Date.now() - (startTime.current || 0)) / 1000) }));
    }, 1000);

    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, speed } = position.coords;
        const now = Date.now();
        const currentSpeedKmh = (speed || 0) * 3.6; // m/s to km/h

        if (lastPos.current) {
          const dist = calculateDistance(lastPos.current.lat, lastPos.current.lng, latitude, longitude);
          const timeDiff = (now - lastPos.current.time) / 1000; // seconds
          
          if (timeDiff > 0) {
            const accel = (currentSpeedKmh - lastPos.current.speed) / (timeDiff / 3600); // km/h^2
            // Convert to m/s^2 for easier thresholding
            const accelMs2 = (accel / 3600); 

            setTripStats(prev => {
              const newDistance = prev.distance + dist;
              const newMaxAccel = Math.max(prev.maxAcceleration, accelMs2);
              const newMaxBraking = Math.min(prev.maxBraking, accelMs2);
              
              let highAccelCount = prev.highAccelCount;
              let heavyBrakingCount = prev.heavyBrakingCount;

              if (accelMs2 > 2.5) highAccelCount++; // Threshold for aggressive acceleration
              if (accelMs2 < -3.0) heavyBrakingCount++; // Threshold for heavy braking

              return {
                ...prev,
                distance: newDistance,
                currentSpeed: currentSpeedKmh,
                avgSpeed: (newDistance / (prev.duration / 3600)) || 0,
                maxAcceleration: newMaxAccel,
                maxBraking: newMaxBraking,
                highAccelCount,
                heavyBrakingCount,
              };
            });
          }
        }

        lastPos.current = { lat: latitude, lng: longitude, time: now, speed: currentSpeedKmh };
      },
      (error) => console.error(error),
      { enableHighAccuracy: true }
    );
  };

  const stopTrip = () => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsTracking(false);
    
    // Auto-fill form with trip data
    setFormData({
      speed: Math.round(tripStats.avgSpeed) || 65,
      braking: tripStats.heavyBrakingCount > 5 ? 'frequent' : tripStats.heavyBrakingCount > 2 ? 'normal' : 'rare',
      acceleration: tripStats.highAccelCount > 5 ? 'aggressive' : tripStats.highAccelCount > 2 ? 'normal' : 'smooth',
      idleTime: 5, // Hard to detect idle time perfectly without more logic
      monthlyKm: Math.round(tripStats.distance * 30), // Extrapolate
    });
  };

  useEffect(() => {
    return () => {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const wasteResult = calculateFuelWaste({
      ...formData,
      tyreVisualCondition: state.tyreScans[0]?.visualCondition || 85,
      fuelPrice: 100,
    });

    setResult(wasteResult);
    addDrivingLog({
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      distance: formData.monthlyKm,
      speed: formData.speed,
      braking: formData.braking as any,
      acceleration: formData.acceleration as any,
      idleTime: formData.idleTime,
    });
    setIsAnalyzing(false);
  };

  if (result) {
    return (
      <div className="space-y-8 pb-12">
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-black text-gray-900">Analysis Results</h1>
          <NeonButton variant="default" size="sm" onClick={() => setResult(null)}>
            New Analysis
          </NeonButton>
        </header>

        <div className="bg-[#F9A825] text-white p-8 rounded-3xl shadow-lg flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 font-black text-2xl mb-1">
              <AlertCircle size={32} /> Fuel Waste Detected
            </div>
            <p className="font-bold opacity-90 text-lg">Your driving habits are causing a {Math.round(result.wastePercentage)}% efficiency loss.</p>
          </div>
          <div className="text-5xl font-black">-{Math.round(result.wastePercentage)}%</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <IssueCard 
            icon={<TrendingDown className="text-red-500" />}
            title="Harsh Braking"
            impact="-20% efficiency"
            cost={`₹${Math.round(result.monthlySavingsPotential * 0.4)}/month`}
            fix="Practice gradual braking"
          />
          <IssueCard 
            icon={<Gauge className="text-orange-500" />}
            title="Excessive Speed"
            impact="-15% efficiency"
            cost={`₹${Math.round(result.monthlySavingsPotential * 0.3)}/month`}
            fix="Maintain 50-60 km/h"
          />
          <IssueCard 
            icon={<Clock className="text-yellow-500" />}
            title="Extended Idling"
            impact="Direct fuel burn"
            cost={`₹${Math.round(result.monthlySavingsPotential * 0.2)}/month`}
            fix="Turn off engine during waits"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card title="Efficiency Summary">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-600">Current Efficiency</span>
                <span className="font-black text-xl text-red-500">{result.currentEfficiency.toFixed(1)} km/L</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-600">Potential Efficiency</span>
                <span className="font-black text-xl text-green-600">15.0 km/L</span>
              </div>
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="font-black text-gray-900">Improvement Possible</span>
                <span className="font-black text-2xl text-[#1C7293]">+38%</span>
              </div>
            </div>
          </Card>

          <Card title="Monthly Cost Breakdown">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-600">Current Fuel Cost</span>
                <span className="font-black text-gray-900">₹{Math.round(result.cost).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-600">Wastage</span>
                <span className="font-black text-red-500">₹{Math.round(result.monthlySavingsPotential).toLocaleString()}</span>
              </div>
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="font-black text-gray-900">Potential Savings</span>
                <span className="font-black text-2xl text-[#2C5F2D]">₹{Math.round(result.monthlySavingsPotential).toLocaleString()}/mo</span>
              </div>
            </div>
          </Card>
        </div>

        <Card title="Actionable Tips" className="bg-[#065A82] text-white border-none">
          <div className="space-y-4 mt-2">
            <TipItem number={1} text={`Reduce braking frequency → Save ₹${Math.round(result.monthlySavingsPotential * 0.4)}/month`} />
            <TipItem number={2} text={`Lower average speed to 60 km/h → Save ₹${Math.round(result.monthlySavingsPotential * 0.3)}/month`} />
            <TipItem number={3} text={`Minimize idle time → Save ₹${Math.round(result.monthlySavingsPotential * 0.2)}/month`} />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <header className="text-center">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Fuel Waste Analyzer</h1>
        <p className="text-gray-500 font-bold mt-2">Identify inefficient driving habits and optimize consumption</p>
      </header>

      {/* Trip Tracking UI */}
      <Card className="bg-[#065A82] text-white border-none overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Navigation size={120} />
        </div>
        <div className="relative z-10 p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black">Live Trip Tracker</h2>
              <p className="text-sm font-bold opacity-70">Get real-time data via GPS</p>
            </div>
            {isTracking ? (
              <div className="flex items-center gap-2 bg-red-500 px-4 py-2 rounded-full animate-pulse">
                <div className="w-2 h-2 bg-white rounded-full" />
                <span className="text-xs font-black uppercase tracking-widest">Recording</span>
              </div>
            ) : (
              <div className="bg-white/20 px-4 py-2 rounded-full">
                <span className="text-xs font-black uppercase tracking-widest">Ready</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <TripStat label="Distance" value={`${tripStats.distance.toFixed(2)} km`} />
            <TripStat label="Speed" value={`${Math.round(tripStats.currentSpeed)} km/h`} />
            <TripStat label="Duration" value={`${Math.floor(tripStats.duration / 60)}m ${tripStats.duration % 60}s`} />
            <TripStat label="Avg Speed" value={`${Math.round(tripStats.avgSpeed)} km/h`} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-white/10 p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className={tripStats.highAccelCount > 0 ? "text-yellow-400" : "text-white/40"} />
                <span className="text-sm font-bold">Aggressive Accel</span>
              </div>
              <span className="font-black text-xl">{tripStats.highAccelCount}</span>
            </div>
            <div className="bg-white/10 p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingDown className={tripStats.heavyBrakingCount > 0 ? "text-red-400" : "text-white/40"} />
                <span className="text-sm font-bold">Heavy Braking</span>
              </div>
              <span className="font-black text-xl">{tripStats.heavyBrakingCount}</span>
            </div>
          </div>

          <StarButton 
            lightColor="#FAFAFA"
            className={`w-full h-14 rounded-2xl text-lg font-black flex items-center justify-center gap-2 ${isTracking ? 'bg-red-600' : 'bg-white text-[#065A82]'}`}
            onClick={isTracking ? stopTrip : startTrip}
          >
            {isTracking ? (
              <><Square size={20} fill="currentColor" /> Stop Trip</>
            ) : (
              <><Play size={20} fill="currentColor" /> Start Trip</>
            )}
          </StarButton>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputCard 
          icon={<Gauge className="text-[#065A82]" />}
          title="Average Speed"
          value={`${formData.speed} km/h`}
          tooltip="Optimal range: 50-60 km/h"
        >
          <input 
            type="range" 
            min="0" max="120" 
            value={formData.speed} 
            onChange={(e) => setFormData({ ...formData, speed: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#065A82]"
          />
        </InputCard>

        <InputCard 
          icon={<Activity className="text-[#065A82]" />}
          title="Braking Frequency"
          value={formData.braking.toUpperCase()}
        >
          <select 
            value={formData.braking}
            onChange={(e) => setFormData({ ...formData, braking: e.target.value })}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-700 outline-none focus:ring-2 focus:ring-[#065A82]"
          >
            <option value="rare">Rare (&lt; 5 times per 10km)</option>
            <option value="normal">Normal (5-10 times per 10km)</option>
            <option value="frequent">Frequent (&gt; 10 times per 10km)</option>
          </select>
        </InputCard>

        <InputCard 
          icon={<Zap className="text-[#065A82]" />}
          title="Acceleration Style"
          value={formData.acceleration.toUpperCase()}
        >
          <div className="flex gap-2">
            {['smooth', 'normal', 'aggressive'].map((style) => (
              <button
                key={style}
                onClick={() => setFormData({ ...formData, acceleration: style })}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                  formData.acceleration === style 
                  ? 'bg-[#065A82] text-white shadow-md' 
                  : 'bg-gray-50 text-gray-500 border border-gray-100'
                }`}
              >
                {style.charAt(0).toUpperCase() + style.slice(1)}
              </button>
            ))}
          </div>
        </InputCard>

        <InputCard 
          icon={<Clock className="text-[#065A82]" />}
          title="Daily Idle Time"
          value={`${formData.idleTime} min`}
          warning={formData.idleTime > 10 ? "Excessive idling detected" : undefined}
        >
          <input 
            type="range" 
            min="0" max="30" 
            value={formData.idleTime} 
            onChange={(e) => setFormData({ ...formData, idleTime: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#065A82]"
          />
        </InputCard>

        <InputCard 
          icon={<Route className="text-[#065A82]" />}
          title="Monthly Distance"
          value={`${formData.monthlyKm} km`}
          className="md:col-span-2"
        >
          <input 
            type="number" 
            value={formData.monthlyKm} 
            onChange={(e) => setFormData({ ...formData, monthlyKm: parseInt(e.target.value) || 0 })}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-700 outline-none focus:ring-2 focus:ring-[#065A82]"
          />
        </InputCard>
      </div>

      <StarButton 
        lightColor={theme === 'dark' ? '#FAFAFA' : '#065A82'}
        className="w-full h-16 rounded-2xl text-xl font-black" 
        disabled={isAnalyzing || isTracking}
        onClick={handleAnalyze}
      >
        {isAnalyzing ? 'Analyzing...' : 'Analyze My Driving'}
      </StarButton>

      <AnimatePresence>
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-6"
          >
            <div className="bg-white rounded-3xl p-12 max-w-sm w-full text-center">
              <div className="w-20 h-20 border-4 border-[#065A82] border-t-transparent rounded-full animate-spin mx-auto mb-8" />
              <h2 className="text-2xl font-black text-gray-900 mb-2">Analyzing Patterns</h2>
              <p className="text-gray-500 font-bold">Calculating your fuel efficiency and preparing recommendations...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TripStat({ label, value }: { label: string, value: string }) {
  return (
    <div>
      <div className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{label}</div>
      <div className="text-xl font-black">{value}</div>
    </div>
  );
}

function InputCard({ icon, title, value, children, tooltip, warning, className }: any) {
  return (
    <Card className={className}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-xl">
            {icon}
          </div>
          <h3 className="font-bold text-gray-900">{title}</h3>
        </div>
        <div className="text-lg font-black text-[#065A82]">{value}</div>
      </div>
      {children}
      {tooltip && <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-wider">{tooltip}</p>}
      {warning && <p className="text-[10px] font-bold text-red-500 mt-2 uppercase tracking-wider flex items-center gap-1"><AlertCircle size={10} /> {warning}</p>}
    </Card>
  );
}

function IssueCard({ icon, title, impact, cost, fix }: any) {
  return (
    <Card className="flex flex-col gap-3">
      <div className="text-2xl">{icon}</div>
      <h4 className="font-bold text-gray-900">{title}</h4>
      <div className="space-y-1">
        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Impact: {impact}</div>
        <div className="text-xs font-black text-red-500 uppercase tracking-wider">Cost: {cost} wasted</div>
      </div>
      <div className="mt-2 pt-3 border-t border-gray-50 text-xs font-bold text-[#1C7293]">
        FIX: {fix}
      </div>
    </Card>
  );
}

function TipItem({ number, text }: { number: number, text: string }) {
  return (
    <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl">
      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-black">{number}</div>
      <p className="text-sm font-bold">{text}</p>
    </div>
  );
}
