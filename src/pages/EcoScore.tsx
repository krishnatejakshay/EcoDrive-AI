import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, Minus, CheckCircle2, AlertCircle, CircleDot, Fuel, Trophy, Zap, Clock } from 'lucide-react';
import { Card, Gauge, Button } from '../components/UI';
import { useApp } from '../context/AppContext';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { calculateEcoScore } from '../services/ecoService';

export function EcoScore() {
  const { state } = useApp();
  
  const latestScan = state.tyreScans[0];
  const latestLog = state.drivingLogs[0];
  
  const currentScore = useMemo(() => {
    return calculateEcoScore({
      tyreVisualCondition: latestScan?.visualCondition || 85,
      braking: latestLog?.braking || 'normal',
      acceleration: latestLog?.acceleration || 'normal',
      speed: latestLog?.speed || 65,
      idleTime: latestLog?.idleTime || 5,
      improvedFromLastWeek: true, // Mock for now
    });
  }, [latestScan, latestLog]);

  const history = useMemo(() => {
    if (state.ecoScores.length > 0) {
      return state.ecoScores;
    }
    // Fallback to mock if no real history
    return [
      { week: 'W1', score: 58 },
      { week: 'W2', score: 62 },
      { week: 'W3', score: 60 },
      { week: 'W4', score: 65 },
      { week: 'W5', score: 63 },
      { week: 'W6', score: 67 },
      { week: 'W7', score: 66 },
      { week: 'W8', score: currentScore },
    ];
  }, [state.ecoScores, currentScore]);

  return (
    <div className="space-y-8 pb-12">
      <header className="text-center">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Eco Score System</h1>
        <p className="text-gray-500 font-bold mt-2">Track your progress with personalized sustainability scores</p>
      </header>

      <div className="flex flex-col items-center justify-center py-12">
        <Gauge value={currentScore} size={300} strokeWidth={25} label={currentScore > 80 ? "Excellent Driver" : currentScore > 60 ? "Good Driver" : "Needs Improvement"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Score Breakdown">
          <div className="space-y-6">
            <div className="flex items-center justify-between font-black text-lg">
              <span>Starting Points</span>
              <span className="text-gray-400">100</span>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-xs font-black text-red-500 uppercase tracking-widest">Deductions Applied</h4>
              {latestScan && latestScan.visualCondition < 80 && (
                <ScoreRow icon={<CircleDot size={16} />} label={`Tyre condition (${latestScan.visualCondition}%)`} value={latestScan.visualCondition < 40 ? -25 : latestScan.visualCondition < 60 ? -15 : -10} color="text-red-500" />
              )}
              {latestLog?.braking === 'frequent' && (
                <ScoreRow icon={<Zap size={16} />} label="Frequent braking" value={-15} color="text-red-500" />
              )}
              {latestLog?.speed && latestLog.speed > 80 && (
                <ScoreRow icon={<TrendingUp size={16} />} label="High speed (>80 km/h)" value={-10} color="text-red-500" />
              )}
              {latestLog?.idleTime && latestLog.idleTime > 10 && (
                <ScoreRow icon={<Clock size={16} />} label="Excessive idle time" value={-5} color="text-red-500" />
              )}
              {(!latestScan || latestScan.visualCondition >= 80) && (!latestLog || (latestLog.braking !== 'frequent' && latestLog.speed <= 80 && latestLog.idleTime <= 10)) && (
                <p className="text-sm text-gray-400 font-bold italic">No major deductions applied! Keep it up.</p>
              )}
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-black text-green-600 uppercase tracking-widest">Bonuses Earned</h4>
              {latestLog?.acceleration === 'smooth' && (
                <ScoreRow icon={<TrendingUp size={16} />} label="Smooth acceleration" value={5} color="text-green-600" isBonus />
              )}
              {latestScan && latestScan.visualCondition > 90 && (
                <ScoreRow icon={<CircleDot size={16} />} label="Excellent tyre maintenance" value={5} color="text-green-600" isBonus />
              )}
              <ScoreRow icon={<CheckCircle2 size={16} />} label="Consistent improvement" value={5} color="text-green-600" isBonus />
            </div>

            <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
              <span className="text-2xl font-black text-gray-900">Final Score</span>
              <span className="text-4xl font-black text-[#065A82]">{currentScore}/100</span>
            </div>
          </div>
        </Card>

        <Card title="Improvement Tracker">
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold', fill: '#9CA3AF' }} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="score" stroke="#065A82" strokeWidth={4} dot={{ r: 6, fill: '#065A82', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                <TrendingUp size={20} />
              </div>
              <div>
                <div className="text-sm font-black text-gray-900">Improving</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Trend Indicator</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-gray-500">Reached 'Good' status</div>
              <div className="text-[10px] font-black text-[#1C7293] uppercase tracking-wider">2 weeks ago</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card title="Rating Categories">
          <div className="space-y-3 mt-2">
            <RatingCategory label="Needs Major Improvement" range="0-40" color="bg-[#F96167]" active={currentScore <= 40} />
            <RatingCategory label="Below Average" range="41-60" color="bg-[#F9A825]" active={currentScore > 40 && currentScore <= 60} />
            <RatingCategory label="Good" range="61-75" color="bg-[#1C7293]" active={currentScore > 60 && currentScore <= 75} />
            <RatingCategory label="Very Good" range="76-85" color="bg-[#2C5F2D]" active={currentScore > 75 && currentScore <= 85} />
            <RatingCategory label="Excellent Eco-Driver" range="86-100" color="bg-[#21295C]" active={currentScore > 85} />
          </div>
        </Card>

        <Card title="Tips to Improve">
          <div className="space-y-4 mt-2">
            {latestScan && latestScan.visualCondition < 60 ? (
              <ImprovementTip 
                icon={<AlertCircle className="text-red-500" />}
                text={`🔴 URGENT: Replace worn tyre (${latestScan.visualCondition}%) to gain +15 points + safety`}
              />
            ) : (
              <ImprovementTip 
                icon={<CheckCircle2 className="text-green-600" />}
                text="Tyre condition is good. Maintain regular pressure checks."
              />
            )}
            {latestLog?.braking === 'frequent' ? (
              <ImprovementTip 
                icon={<TrendingUp className="text-[#1C7293]" />}
                text="Focus on reducing harsh braking to gain +15 points"
              />
            ) : (
              <ImprovementTip 
                icon={<CheckCircle2 className="text-green-600" />}
                text="Braking habits are smooth. Keep it up!"
              />
            )}
            <ImprovementTip 
              icon={<CheckCircle2 className="text-green-600" />}
              text="Maintain current speed habits (doing great!)"
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

function ScoreRow({ icon, label, value, color, isBonus }: { icon?: React.ReactNode, label: string, value: number, color: string, isBonus?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm font-bold">
      <div className="flex items-center gap-2">
        {icon && <span className={color}>{icon}</span>}
        <span className="text-gray-600">{label}</span>
      </div>
      <span className={color}>{isBonus ? '+' : ''}{value} points</span>
    </div>
  );
}

function RatingCategory({ label, range, color, active }: { label: string, range: string, color: string, active?: boolean }) {
  return (
    <div className={`flex items-center justify-between p-3 rounded-xl transition-all ${active ? 'bg-gray-50 border border-gray-200 shadow-sm' : 'opacity-40'}`}>
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${color}`} />
        <span className="text-sm font-bold text-gray-900">{label}</span>
      </div>
      <span className="text-xs font-black text-gray-400">{range}</span>
    </div>
  );
}

function ImprovementTip({ icon, text }: { icon: React.ReactNode, text: string }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
      <div className="mt-0.5">{icon}</div>
      <p className="text-sm font-bold text-gray-700 leading-relaxed">{text}</p>
    </div>
  );
}
