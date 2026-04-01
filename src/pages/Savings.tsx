import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Wallet, TrendingUp, CheckCircle2, AlertCircle, Download, Mail, Share2, Route, Fuel, Gauge } from 'lucide-react';
import { Card, Button } from '../components/UI';
import { Button as NeonButton } from '../components/ui/neon-button';
import { useApp } from '../context/AppContext';

export function Savings() {
  const { state } = useApp();
  const [inputs, setInputs] = useState({
    monthlyKm: 1000,
    fuelPrice: 100,
    efficiency: 15,
  });

  const wastePercentage = 28;
  const tyreImpact = 12;
  const drivingImpact = 20;

  const currentEfficiency = inputs.efficiency * (1 - (tyreImpact + drivingImpact) / 100);
  const currentFuelNeeded = inputs.monthlyKm / currentEfficiency;
  const currentCost = currentFuelNeeded * inputs.fuelPrice;
  
  const optimizedFuelNeeded = inputs.monthlyKm / inputs.efficiency;
  const optimizedCost = optimizedFuelNeeded * inputs.fuelPrice;
  const savings = currentCost - optimizedCost;

  return (
    <div className="space-y-8 pb-12">
      <header className="text-center">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Savings Calculator</h1>
        <p className="text-gray-500 font-bold mt-2">See how much you can save by optimizing your driving</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card title="User Configuration" className="lg:col-span-1">
          <div className="space-y-8 mt-4">
            <CalculatorInput 
              label="Monthly Distance" 
              value={`${inputs.monthlyKm} km`} 
              icon={<Route size={18} />}
            >
              <input 
                type="range" min="500" max="3000" step="100"
                value={inputs.monthlyKm}
                onChange={(e) => setInputs({ ...inputs, monthlyKm: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#065A82]"
              />
            </CalculatorInput>

            <CalculatorInput 
              label="Fuel Price" 
              value={`₹${inputs.fuelPrice}/L`} 
              icon={<Fuel size={18} />}
            >
              <input 
                type="number"
                value={inputs.fuelPrice}
                onChange={(e) => setInputs({ ...inputs, fuelPrice: parseInt(e.target.value) || 0 })}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-700 outline-none"
              />
            </CalculatorInput>

            <CalculatorInput 
              label="Car Efficiency" 
              value={`${inputs.efficiency} km/L`} 
              icon={<Gauge size={18} />}
            >
              <input 
                type="number"
                value={inputs.efficiency}
                onChange={(e) => setInputs({ ...inputs, efficiency: parseInt(e.target.value) || 0 })}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-700 outline-none"
              />
            </CalculatorInput>

            <div className="pt-6 border-t border-gray-100 space-y-3">
              <div className="text-xs font-black text-gray-400 uppercase tracking-widest">Auto-Detected Data</div>
              <div className="flex justify-between text-sm font-bold">
                <span className="text-gray-600">Fuel Waste</span>
                <span className="text-red-500">{wastePercentage}%</span>
              </div>
              <div className="flex justify-between text-sm font-bold">
                <span className="text-gray-600">Tyre Impact</span>
                <span className="text-red-500">{tyreImpact}%</span>
              </div>
            </div>
          </div>
        </Card>

        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gray-900 text-white border-none">
              <h3 className="text-xs font-black uppercase tracking-widest opacity-60 mb-4">Current State</h3>
              <div className="space-y-4">
                <StatRow label="Monthly distance" value={`${inputs.monthlyKm} km`} />
                <StatRow label="Fuel needed" value={`${currentFuelNeeded.toFixed(1)} L`} />
                <StatRow label="Fuel cost" value={`₹${Math.round(currentCost).toLocaleString()}`} />
                <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                  <span className="text-sm font-bold opacity-60">Wastage</span>
                  <span className="text-xl font-black text-[#F96167]">₹{Math.round(currentCost - optimizedCost).toLocaleString()}</span>
                </div>
              </div>
            </Card>

            <Card className="bg-[#2C5F2D] text-white border-none">
              <h3 className="text-xs font-black uppercase tracking-widest opacity-60 mb-4">Optimized State</h3>
              <div className="space-y-4">
                <StatRow label="Monthly distance" value={`${inputs.monthlyKm} km`} />
                <StatRow label="Fuel needed" value={`${optimizedFuelNeeded.toFixed(1)} L`} />
                <StatRow label="Fuel cost" value={`₹${Math.round(optimizedCost).toLocaleString()}`} />
                <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                  <span className="text-sm font-bold opacity-60">Savings</span>
                  <span className="text-xl font-black text-green-300">₹{Math.round(savings).toLocaleString()}</span>
                </div>
              </div>
            </Card>
          </div>

          <Card className="bg-white p-12 flex flex-col items-center justify-center text-center">
            <div className="text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Potential Monthly Savings</div>
            <div className="text-7xl font-black text-[#2C5F2D] mb-2">₹{Math.round(savings).toLocaleString()}</div>
            <div className="text-xl font-bold text-gray-500">Annual Savings: ₹{Math.round(savings * 12).toLocaleString()}</div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mt-12">
              <SavingsHighlight icon="🛞" label="From Tyres" value={`₹${Math.round(savings * 0.4)}`} />
              <SavingsHighlight icon="⛽" label="From Driving" value={`₹${Math.round(savings * 0.6)}`} />
              <SavingsHighlight icon="🌳" label="CO₂ Reduced" value="42 kg" />
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card title="Insights & Tips">
          <div className="space-y-4 mt-2">
            <InsightItem icon={<CheckCircle2 className="text-green-600" />} text="Excellent! New tyre improved safety and efficiency" />
            <InsightItem icon={<CheckCircle2 className="text-green-600" />} text="Braking improved 35% this week" />
            <InsightItem icon={<AlertCircle className="text-[#F9A825]" />} text="Friday: High-speed driving detected" />
          </div>
        </Card>

        <Card title="Next Week Goals">
          <div className="space-y-4 mt-2">
            <GoalItem text="Maintain Eco Score above 75" />
            <GoalItem text="Keep tyre in good condition (check pressure weekly)" />
            <GoalItem text="Save ₹600 this week" />
          </div>
        </Card>
      </div>

      <div className="flex flex-wrap gap-4 justify-center">
        <NeonButton variant="default" className="gap-2 h-12 px-6 rounded-xl"><Download size={18} /> Download PDF</NeonButton>
        <NeonButton variant="default" className="gap-2 h-12 px-6 rounded-xl"><Mail size={18} /> Email Report</NeonButton>
        <NeonButton variant="solid" className="gap-2 h-12 px-6 rounded-xl"><Share2 size={18} /> Share on WhatsApp</NeonButton>
      </div>
    </div>
  );
}

function CalculatorInput({ label, value, icon, children }: any) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
          {icon} {label}
        </div>
        <div className="text-lg font-black text-[#065A82]">{value}</div>
      </div>
      {children}
    </div>
  );
}

function StatRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between text-sm font-bold">
      <span className="opacity-60">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function SavingsHighlight({ icon, label, value }: { icon: string, label: string, value: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</div>
      <div className="text-xl font-black text-gray-900">{value}</div>
    </div>
  );
}

function InsightItem({ icon, text }: { icon: React.ReactNode, text: string }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
      <div className="mt-0.5">{icon}</div>
      <p className="text-sm font-bold text-gray-700">{text}</p>
    </div>
  );
}

function GoalItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
      <div className="text-xl">🎯</div>
      <p className="text-sm font-bold text-[#065A82]">{text}</p>
    </div>
  );
}
