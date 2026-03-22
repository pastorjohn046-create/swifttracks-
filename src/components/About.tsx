import React from 'react';
import { motion } from 'motion/react';
import { Globe, Shield, Zap, Heart } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-6xl mx-auto py-20 px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-20"
      >
        <h1 className="text-8xl font-black tracking-tighter uppercase mb-6 leading-none">
          Swift<span className="text-accent">Track</span>
        </h1>
        <p className="text-xl font-bold uppercase tracking-widest opacity-60">
          The Future of Global Logistics, Simplified.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
        <div className="card-brutal p-10 bg-secondary/10">
          <h2 className="text-4xl font-black uppercase mb-6 tracking-tight">Our Mission</h2>
          <p className="text-lg font-medium leading-relaxed">
            We believe that shipping shouldn't be a headache. SwiftTrack was born from a desire to bring transparency, speed, and a touch of personality to the logistics world. We're not just moving boxes; we're moving dreams, businesses, and connections.
          </p>
        </div>
        <div className="card-brutal p-10 bg-tertiary/10">
          <h2 className="text-4xl font-black uppercase mb-6 tracking-tight">Why Us?</h2>
          <p className="text-lg font-medium leading-relaxed">
            In a world of boring tracking pages and faceless corporations, we stand out. Our platform is built on cutting-edge tech, but our heart is human. We're playful, professional, and obsessed with your satisfaction.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
        {[
          { icon: Globe, title: 'Global Reach', color: 'bg-accent' },
          { icon: Shield, title: 'Secure Handling', color: 'bg-secondary' },
          { icon: Zap, title: 'Lightning Fast', color: 'bg-tertiary' },
          { icon: Heart, title: 'Customer First', color: 'bg-quaternary' },
        ].map((item, i) => (
          <motion.div 
            key={i}
            whileHover={{ scale: 1.05, rotate: i % 2 === 0 ? 2 : -2 }}
            className="card-brutal p-8 text-center flex flex-col items-center gap-4"
          >
            <div className={`p-4 rounded-full ${item.color} border-2 border-ink`}>
              <item.icon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight">{item.title}</h3>
          </motion.div>
        ))}
      </div>

      <div className="card-brutal p-12 bg-ink text-bg text-center">
        <h2 className="text-5xl font-black uppercase mb-8 tracking-tighter">Ready to ship?</h2>
        <p className="text-xl mb-10 opacity-80 max-w-2xl mx-auto">
          Join thousands of happy customers who trust SwiftTrack with their most important consignments.
        </p>
        <button className="btn-primary bg-accent text-ink border-accent shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]">
          Get Started Now
        </button>
      </div>
    </div>
  );
}
