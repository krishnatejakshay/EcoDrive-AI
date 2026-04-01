import React from 'react';
import { motion } from 'motion/react';
import { FileText, Download, Mail, Share2, TrendingUp, AlertCircle, CheckCircle2, Calendar } from 'lucide-react';
import { Card, Button } from '../components/UI';
import { Button as NeonButton } from '../components/ui/neon-button';
import { useApp } from '../context/AppContext';

export function Reports() {
  const { state } = useApp();

  return (
    <div className="space-y-8 pb-12">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Weekly Reports</h1>
          <p className="text-gray-500 font-bold">Your driving performance summary</p>
        </div>
        <div className="flex gap-2">
          <NeonButton variant="default" size="sm" className="gap-2 h-10 px-4"><Download size={16} /> PDF</NeonButton>
          <NeonButton variant="default" size="sm" className="gap-2 h-10 px-4"><Share2 size={16} /> Share</NeonButton>
        </div>
      </header>

      <Card className="bg-[#065A82] text-white border-none p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <div className="text-sm font-black uppercase tracking-widest opacity-70 mb-2">Current Week</div>
            <div className="text-4xl font-black mb-1">March 24 - March 31</div>
            <p className="text-lg font-bold opacity-90">Performance: Excellent (Eco Score 82)</p>
          </div>
          <div className="flex gap-8">
            <div className="text-center">
              <div className="text-3xl font-black">₹950</div>
              <div className="text-[10px] font-black uppercase tracking-widest opacity-70">Saved</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black">12kg</div>
              <div className="text-[10px] font-black uppercase tracking-widest opacity-70">CO₂ Reduced</div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2" title="Daily Performance">
          <div className="space-y-4 mt-4">
            <DayRow day="Monday" score={85} savings={150} status="excellent" />
            <DayRow day="Tuesday" score={78} savings={120} status="good" />
            <DayRow day="Wednesday" score={82} savings={140} status="excellent" />
            <DayRow day="Thursday" score={65} savings={80} status="warning" />
            <DayRow day="Friday" score={88} savings={180} status="excellent" />
            <DayRow day="Saturday" score={92} savings={210} status="excellent" />
            <DayRow day="Sunday" score={75} savings={110} status="good" />
          </div>
        </Card>

        <div className="space-y-8">
          <Card title="Insights & Tips">
            <div className="space-y-4 mt-2">
              <InsightItem icon={<CheckCircle2 className="text-green-600" />} text="Excellent! New tyre improved safety and efficiency" />
              <InsightItem icon={<CheckCircle2 className="text-green-600" />} text="Braking improved 35% this week" />
              <InsightItem icon={<AlertCircle className="text-[#F9A825]" />} text="Friday: High-speed driving detected" />
            </div>
          </Card>

          <Card title="Next Week Goals">
            <div className="space-y-4 mt-2">
              <div className="flex items-center gap-3 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                <div className="text-xl">🎯</div>
                <p className="text-sm font-bold text-[#065A82]">Maintain Eco Score above 75</p>
              </div>
              <div className="flex items-center gap-3 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                <div className="text-xl">🎯</div>
                <p className="text-sm font-bold text-[#065A82]">Save ₹600 this week</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-black text-gray-900">Past Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PastReportItem date="March 17 - March 23" score={74} savings={820} />
          <PastReportItem date="March 10 - March 16" score={68} savings={750} />
          <PastReportItem date="March 03 - March 09" score={55} savings={420} />
          <PastReportItem date="Feb 24 - March 02" score={62} savings={580} />
        </div>
      </div>
    </div>
  );
}

function DayRow({ day, score, savings, status }: { day: string, score: number, savings: number, status: string }) {
  const colors: any = {
    excellent: 'bg-[#2C5F2D]',
    good: 'bg-[#1C7293]',
    warning: 'bg-[#F9A825]',
    danger: 'bg-[#F96167]',
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
      <div className="flex items-center gap-4">
        <div className={`w-3 h-3 rounded-full ${colors[status]}`} />
        <span className="font-bold text-gray-900 w-24">{day}</span>
      </div>
      <div className="flex items-center gap-8">
        <div className="text-right">
          <div className="text-xs font-black text-gray-400 uppercase tracking-widest">Score</div>
          <div className="font-black text-gray-900">{score}</div>
        </div>
        <div className="text-right">
          <div className="text-xs font-black text-gray-400 uppercase tracking-widest">Saved</div>
          <div className="font-black text-[#2C5F2D]">₹{savings}</div>
        </div>
      </div>
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

function PastReportItem({ date, score, savings }: { date: string, score: number, savings: number }) {
  return (
    <div className="flex items-center justify-between p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-[#065A82]">
          <Calendar size={20} />
        </div>
        <div>
          <div className="font-bold text-gray-900">{date}</div>
          <div className="text-xs text-gray-500 font-bold">Eco Score: {score}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="font-black text-[#2C5F2D]">₹{savings}</div>
        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Saved</div>
      </div>
    </div>
  );
}
