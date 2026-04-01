import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Scan, Activity, FileText, TrendingUp, Leaf, Wallet, ArrowUpRight } from 'lucide-react';
import { Card, Gauge, Button } from '../components/UI';
import { Button as NeonButton } from '../components/ui/neon-button';
import { StarButton } from '../components/ui/star-button';
import { useTheme } from 'next-themes';
import { useApp } from '../context/AppContext';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

export function Dashboard() {
  const { state } = useApp();
  const { theme } = useTheme();
  const currentScore = state.ecoScores[0]?.score || 0;
  const monthlySavings = state.savings.monthly[0] || 0;
  const carbonReduced = state.co2.monthly[0] || 0;

  const lightColor = theme === 'dark' ? '#FAFAFA' : '#065A82';

  const getRating = (score: number) => {
    if (score < 40) return { text: 'Needs Improvement', color: 'text-[#F96167]' };
    if (score < 70) return { text: 'Below Average', color: 'text-[#F9A825]' };
    if (score < 85) return { text: 'Good', color: 'text-[#1C7293]' };
    return { text: 'Excellent', color: 'text-[#2C5F2D]' };
  };

  const rating = getRating(currentScore);

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Dashboard</h1>
          <div className="flex items-center gap-2">
            <p className="text-gray-500 font-bold">Welcome back, {state.user.name}!</p>
          </div>
        </div>
        <Link to="/profile">
          <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-2xl">
            👤
          </div>
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="flex flex-col items-center justify-center py-8">
          <Gauge value={currentScore} label="Eco Score" />
          <div className={`mt-4 font-black text-lg ${rating.color}`}>{rating.text}</div>
          <div className="text-xs font-bold text-green-600 mt-1 flex items-center gap-1">
            <ArrowUpRight size={14} /> +5 from last week
          </div>
        </Card>

        <Card title="Monthly Savings" icon={<Wallet className="text-[#1C7293]" />}>
          <div className="text-4xl font-black text-gray-900 mt-2">₹{monthlySavings.toLocaleString()}</div>
          <p className="text-sm text-gray-500 font-bold mt-1">Saved This Month</p>
          <div className="h-16 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={state.savings.monthly.map((v, i) => ({ v, i }))}>
                <Line type="monotone" dataKey="v" stroke="#1C7293" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-wider">
            Annual projection: ₹{(monthlySavings * 12).toLocaleString()}
          </div>
        </Card>

        <Card title="Carbon Impact" icon={<Leaf className="text-[#2C5F2D]" />}>
          <div className="text-4xl font-black text-gray-900 mt-2">{carbonReduced} kg CO₂</div>
          <p className="text-sm text-gray-500 font-bold mt-1">Reduced This Month</p>
          <div className="flex items-center gap-2 mt-6">
            <div className="text-3xl">🌳🌳</div>
            <div className="text-xs font-bold text-gray-500 leading-tight uppercase">
              = 2 trees planted
            </div>
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full mt-4 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '65%' }}
              className="bg-[#2C5F2D] h-full"
            />
          </div>
        </Card>

        <Card title="Quick Actions">
          <div className="grid grid-cols-1 gap-3 mt-2">
            <Link to="/scanner">
              <StarButton lightColor={lightColor} className="w-full justify-start h-12 rounded-xl">
                <Scan size={20} className="mr-2" /> Scan Tyre
              </StarButton>
            </Link>
            <Link to="/analyzer">
              <NeonButton variant="solid" className="w-full justify-start py-3 rounded-xl flex items-center gap-2">
                <Activity size={20} /> Analyze Driving
              </NeonButton>
            </Link>
            <Link to="/reports">
              <NeonButton variant="default" className="w-full justify-start py-3 rounded-xl flex items-center gap-2">
                <FileText size={20} /> View Reports
              </NeonButton>
            </Link>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2" title="Recent Activity">
          <div className="space-y-6 mt-4">
            {state.tyreScans.slice(0, 3).map((scan, i) => (
              <div key={scan.id} className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-xl">🛞</div>
                <div className="flex-1">
                  <div className="font-bold text-gray-900">Tyre Scan Performed</div>
                  <div className="text-xs text-gray-500">{new Date(scan.date).toLocaleDateString()} • {scan.verdict}</div>
                </div>
                <div className={`font-black ${scan.safeToUse ? 'text-green-600' : 'text-red-500'}`}>
                  {scan.visualCondition}%
                </div>
              </div>
            ))}
            {state.tyreScans.length === 0 && (
              <div className="text-center py-8 text-gray-400 font-bold">
                No recent scans. Start by scanning your tyres!
              </div>
            )}
          </div>
        </Card>

        <Card title="Eco Tips" className="bg-[#065A82] text-white border-none">
          <div className="mt-4 space-y-6">
            <div className="bg-white/10 p-4 rounded-2xl">
              <p className="text-sm font-bold leading-relaxed">
                "Did you know? Maintaining 55 km/h saves 15% fuel compared to 85 km/h."
              </p>
            </div>
            <div className="bg-white/10 p-4 rounded-2xl opacity-60">
              <p className="text-sm font-bold leading-relaxed">
                "Smooth acceleration can improve your fuel economy by up to 33% on highways."
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
