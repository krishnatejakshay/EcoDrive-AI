import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { CircleDot, Fuel, Trophy, ArrowRight } from 'lucide-react';
import { Card } from '../components/UI';
import { Button as NeonButton } from '../components/ui/neon-button';
import { StarButton } from '../components/ui/star-button';
import { BackgroundPaths } from '../components/ui/background-paths';

export function Landing() {
  return (
    <BackgroundPaths title="EcoDrive AI">
      <div className="text-center max-w-2xl relative z-10 mx-auto">
        <h1 className="text-6xl md:text-8xl font-black mb-4 tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-[#065A82] to-[#1C7293]">
          EcoDrive AI
        </h1>
        <p className="text-xl md:text-2xl font-bold mb-2 text-gray-600 dark:text-gray-300">Drive Smarter. Save More. Stay Safe.</p>
        <p className="text-lg opacity-80 mb-12 text-gray-500 dark:text-gray-400">Save ₹18,000+ annually while reducing your carbon footprint</p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/login">
            <StarButton className="h-16 px-12 rounded-2xl shadow-2xl text-lg font-black flex items-center gap-2" lightColor="#065A82">
              Get Started <ArrowRight size={24} className="text-[#065A82]" />
            </StarButton>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-6xl w-full">
        <FeatureCard 
          icon={<CircleDot className="text-[#065A82]" size={40} />} 
          title="Tyre Health Scanner" 
          description="AI-powered photo analysis detects wear, cracks, and damage instantly"
        />
        <FeatureCard 
          icon={<Fuel className="text-[#065A82]" size={40} />} 
          title="Fuel Waste Analyzer" 
          description="Identify inefficient driving habits and optimize consumption"
        />
        <FeatureCard 
          icon={<Trophy className="text-[#065A82]" size={40} />} 
          title="Eco Score System" 
          description="Track your progress with personalized sustainability scores"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-24 text-center w-full max-w-4xl mx-auto">
        <StatItem value="₹30,000" label="Average Annual Savings" />
        <StatItem value="500kg" label="CO₂ Reduced Per User" />
        <StatItem value="25" label="Trees Equivalent Impact" />
      </div>
    </BackgroundPaths>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      className="bg-white/50 backdrop-blur-lg p-8 rounded-3xl border border-gray-200 shadow-sm"
    >
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2 text-gray-900">{title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
    </motion.div>
  );
}

function StatItem({ value, label }: { value: string, label: string }) {
  return (
    <div>
      <div className="text-4xl font-black mb-1 text-[#065A82]">{value}</div>
      <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">{label}</div>
    </div>
  );
}
