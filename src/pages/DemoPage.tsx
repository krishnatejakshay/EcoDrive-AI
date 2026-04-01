import React from 'react';
import { Button as NeonButton } from '@/components/ui/neon-button';
import { StarButton } from '@/components/ui/star-button';
import { BackgroundPaths } from '@/components/ui/background-paths';
import { Card } from '@/components/UI';

export function DemoPage() {
  return (
    <div className="space-y-12 pb-20">
      <header className="text-center">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Component Demo</h1>
        <p className="text-gray-500 font-bold mt-2">Preview of the new animated UI components</p>
      </header>

      <section className="space-y-6">
        <h2 className="text-2xl font-black text-[#065A82]">Neon Buttons</h2>
        <Card className="p-8">
          <div className="flex flex-wrap gap-6 items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Default</span>
              <NeonButton>Default Neon</NeonButton>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Solid</span>
              <NeonButton variant="solid">Solid Neon</NeonButton>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Ghost</span>
              <NeonButton variant="ghost">Ghost Neon</NeonButton>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">No Neon</span>
              <NeonButton neon={false}>No Neon Effect</NeonButton>
            </div>
          </div>
        </Card>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-black text-[#065A82]">Star Buttons</h2>
        <Card className="p-8">
          <div className="flex flex-wrap gap-6 items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Default</span>
              <StarButton>Star Button</StarButton>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Custom Color</span>
              <StarButton lightColor="#065A82">Navy Star</StarButton>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Large</span>
              <StarButton className="h-14 px-10 rounded-2xl text-lg">Large Star</StarButton>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Disabled</span>
              <StarButton disabled>Disabled Star</StarButton>
            </div>
          </div>
        </Card>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-black text-[#065A82]">Background Paths</h2>
        <Card className="p-0 overflow-hidden h-[400px] relative">
          <BackgroundPaths title="Animated Background">
            <div className="relative z-10 text-center p-8">
              <h3 className="text-2xl font-black mb-4">Content Over Background</h3>
              <p className="text-gray-600 font-bold">The background paths animate behind your content.</p>
            </div>
          </BackgroundPaths>
        </Card>
      </section>
    </div>
  );
}
