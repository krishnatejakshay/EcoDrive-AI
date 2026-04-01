import React from 'react';
import { motion } from 'motion/react';
import { Leaf, Wind, Droplet, TreePine, TrendingDown, ArrowUpRight } from 'lucide-react';
import { Card, Gauge } from '../components/UI';
import { useApp } from '../context/AppContext';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from 'recharts';

export function Carbon() {
  const { state } = useApp();
  const carbonReduced = 42; // Mock for demo
  
  const history = [
    { month: 'Jan', value: 35 },
    { month: 'Feb', value: 38 },
    { month: 'Mar', value: 42 },
  ];

  return (
    <div className="space-y-8 pb-12">
      <header className="text-center">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Carbon Tracker</h1>
        <p className="text-gray-500 font-bold mt-2">Track your environmental impact and CO₂ reduction</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="bg-[#2C5F2D] text-white border-none flex flex-col items-center justify-center p-12 text-center">
          <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-6">
            <Leaf size={48} className="text-green-300" />
          </div>
          <div className="text-sm font-black uppercase tracking-widest opacity-70 mb-2">Reduced This Month</div>
          <div className="text-7xl font-black mb-2">{carbonReduced} kg</div>
          <div className="text-xl font-bold opacity-90">CO₂ Emissions Saved</div>
          <div className="mt-8 flex items-center gap-2 text-green-300 font-black">
            <ArrowUpRight size={24} /> +12% from last month
          </div>
        </Card>

        <Card title="Monthly Reduction Trend">
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={history}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold', fill: '#9CA3AF' }} />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: '#F3F4F6' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {history.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === history.length - 1 ? '#2C5F2D' : '#D1FAE5'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 flex items-center justify-between text-xs font-black text-gray-400 uppercase tracking-widest">
            <span>Total Lifetime Reduction</span>
            <span className="text-gray-900">230 kg CO₂</span>
          </div>
        </Card>
      </div>

      <Card title="Your Impact Visualization">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 py-8">
          <ImpactStat 
            icon="🌳" 
            value="2.1" 
            label="Trees Planted" 
            description="Equivalent to the CO₂ absorbed by 2 trees in a year"
          />
          <ImpactStat 
            icon="💨" 
            value="168" 
            label="km Not Driven" 
            description="Equivalent to the emissions of a car driving 168 km"
          />
          <ImpactStat 
            icon="🧴" 
            value="105" 
            label="Plastic Bottles" 
            description="Equivalent to the energy used to produce 105 bottles"
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card title="How it Works" className="bg-gray-900 text-white border-none">
          <div className="space-y-6 mt-4">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-xl shrink-0">⛽</div>
              <div>
                <h4 className="font-bold mb-1">Fuel Efficiency</h4>
                <p className="text-sm opacity-60 leading-relaxed">Every liter of fuel saved reduces CO₂ emissions by approximately 2.3 kg.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-xl shrink-0">🛞</div>
              <div>
                <h4 className="font-bold mb-1">Tyre Condition</h4>
                <p className="text-sm opacity-60 leading-relaxed">Worn tyres increase rolling resistance, forcing the engine to work harder and burn more fuel.</p>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Eco Milestones">
          <div className="space-y-4 mt-2">
            <MilestoneItem label="Seedling" target="50 kg" current={42} />
            <MilestoneItem label="Sapling" target="100 kg" current={42} />
            <MilestoneItem label="Forest Guardian" target="500 kg" current={42} />
          </div>
        </Card>
      </div>
    </div>
  );
}

function ImpactStat({ icon, value, label, description }: { icon: string, value: string, label: string, description: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <div className="text-3xl font-black text-gray-900 mb-1">{value}</div>
      <div className="text-sm font-black text-[#2C5F2D] uppercase tracking-widest mb-4">{label}</div>
      <p className="text-xs text-gray-500 font-bold leading-relaxed max-w-[200px]">{description}</p>
    </div>
  );
}

function MilestoneItem({ label, target, current }: { label: string, target: string, current: number }) {
  const targetNum = parseInt(target);
  const progress = Math.min(100, (current / targetNum) * 100);
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-black uppercase tracking-wider">
        <span className="text-gray-600">{label}</span>
        <span className="text-gray-400">{current} / {target}</span>
      </div>
      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="bg-[#2C5F2D] h-full"
        />
      </div>
    </div>
  );
}
