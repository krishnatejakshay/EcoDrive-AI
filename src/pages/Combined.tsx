import React from 'react';
import { motion } from 'motion/react';
import { AlertCircle, TrendingDown, CheckCircle2, ArrowRight } from 'lucide-react';
import { Card, Button } from '../components/UI';
import { useApp } from '../context/AppContext';

export function Combined() {
  const { state } = useApp();
  const lastScan = state.tyreScans[0];
  const lastLog = state.drivingLogs[0];

  const tyreImpact = lastScan ? lastScan.fuelImpactPercentage : 12;
  const drivingImpact = 25; // Mock for demo
  const totalImpact = tyreImpact + drivingImpact;

  return (
    <div className="space-y-8 pb-12">
      <header className="text-center">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">🔥 Combined Impact Analysis</h1>
        <p className="text-gray-500 font-bold mt-2">See how tyre condition + driving habits affect your costs</p>
      </header>

      <div className="flex justify-center py-12">
        <div className="relative w-full max-w-md aspect-square">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute left-0 top-1/2 -translate-y-1/2 w-64 h-64 bg-[#065A82]/20 rounded-full border-2 border-[#065A82] flex items-center justify-center text-center p-6"
          >
            <div className="font-bold text-[#065A82]">
              <div className="text-xs uppercase tracking-wider">Tyre Condition</div>
              <div className="text-2xl font-black">-{tyreImpact}%</div>
              <div className="text-[10px]">efficiency</div>
            </div>
          </motion.div>
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-64 h-64 bg-[#1C7293]/20 rounded-full border-2 border-[#1C7293] flex items-center justify-center text-center p-6"
          >
            <div className="font-bold text-[#1C7293]">
              <div className="text-xs uppercase tracking-wider">Driving Habits</div>
              <div className="text-2xl font-black">-{drivingImpact}%</div>
              <div className="text-[10px]">efficiency</div>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#21295C] rounded-full flex flex-col items-center justify-center text-center text-white shadow-xl z-10"
          >
            <div className="text-xs font-bold uppercase tracking-tighter">Combined</div>
            <div className="text-3xl font-black">-{totalImpact}%</div>
            <div className="text-[10px] font-bold">Total Loss</div>
          </motion.div>
        </div>
      </div>

      <div className="bg-[#F96167] text-white p-8 rounded-3xl shadow-lg">
        <div className="flex items-start gap-4">
          <AlertCircle size={32} className="shrink-0" />
          <div>
            <h3 className="text-xl font-black mb-2 uppercase tracking-tight">Critical Insight</h3>
            <p className="font-bold opacity-90 leading-relaxed">
              Your worn tyre + harsh braking create a dangerous combination:
            </p>
            <ul className="mt-4 space-y-2 font-bold text-sm opacity-80 list-disc list-inside">
              <li>Longer braking distance (unsafe in emergencies)</li>
              <li>Higher fuel consumption (double penalty)</li>
              <li>Increased accident risk in wet conditions</li>
            </ul>
          </div>
        </div>
      </div>

      <Card title="Total Impact Breakdown" className="py-8">
        <div className="space-y-6">
          <ImpactBar label="Worn Tyre (Visual Condition)" value={tyreImpact} color="bg-[#F96167]" />
          <ImpactBar label="Harsh Braking" value={20} color="bg-[#F9A825]" />
          <ImpactBar label="High Speed" value={15} color="bg-[#F9A825]" />
          <div className="pt-4 border-t border-gray-100">
            <ImpactBar label="Total Efficiency Loss" value={totalImpact} color="bg-[#21295C]" isTotal />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card title="Priority Fixes">
          <div className="space-y-4 mt-2">
            <PriorityItem 
              number={1} 
              color="bg-[#F96167]" 
              title="Replace worn tyre URGENTLY" 
              savings="Save ₹600/month + SAFETY"
              action="Replace within 2 weeks"
            />
            <PriorityItem 
              number={2} 
              color="bg-[#F9A825]" 
              title="Reduce harsh braking" 
              savings="Save ₹800/month"
              action="Anticipate stops earlier"
            />
            <PriorityItem 
              number={3} 
              color="bg-[#F9A825]" 
              title="Optimize speed" 
              savings="Save ₹600/month"
              action="Use cruise control"
            />
          </div>
        </Card>

        <Card className="bg-[#2C5F2D] text-white border-none flex flex-col justify-center items-center text-center p-12">
          <div className="text-sm font-bold uppercase tracking-widest opacity-80 mb-2">Total Savings Callout</div>
          <div className="text-5xl font-black mb-2">₹2,700/mo</div>
          <div className="text-xl font-bold opacity-90 mb-8">Annual Savings: ₹32,400</div>
          
          <div className="bg-white/10 p-4 rounded-2xl w-full mb-8">
            <div className="text-xs font-bold uppercase tracking-wider opacity-70">Tyre replacement cost</div>
            <div className="text-xl font-black">₹4,000</div>
            <div className="text-sm font-bold text-green-300 mt-1">Payback period: 1.5 months</div>
          </div>

          <Button variant="success" className="w-full py-4 rounded-xl bg-white text-[#2C5F2D] hover:bg-green-50">
            Apply All Recommendations
          </Button>
        </Card>
      </div>
    </div>
  );
}

function ImpactBar({ label, value, color, isTotal }: { label: string, value: number, color: string, isTotal?: boolean }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm font-bold">
        <span className={isTotal ? 'text-gray-900 font-black' : 'text-gray-600'}>{label}</span>
        <span className={isTotal ? 'text-gray-900 font-black' : 'text-gray-500'}>{value}%</span>
      </div>
      <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          className={`${color} h-full`}
        />
      </div>
    </div>
  );
}

function PriorityItem({ number, color, title, savings, action }: any) {
  return (
    <div className="flex gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
      <div className={`w-8 h-8 ${color} text-white rounded-full flex items-center justify-center font-black shrink-0`}>
        {number}
      </div>
      <div>
        <div className="font-bold text-gray-900">{title}</div>
        <div className="text-xs font-black text-green-600 uppercase tracking-wider mt-1">{savings}</div>
        <div className="text-xs text-gray-500 mt-1">Action: {action}</div>
      </div>
    </div>
  );
}
