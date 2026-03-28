import React from 'react';
import { motion } from 'motion/react';
import { Globe, ShieldCheck, Clock, Package, CheckCircle2, Plane, Truck, Bus, ArrowRight } from 'lucide-react';

export default function About() {
  return (
    <div className="flex flex-col gap-24 sm:gap-40 py-12">
      {/* Hero Section - Editorial Split */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-end">
        <div className="flex flex-col gap-10">
          <div className="flex items-center gap-4">
            <div className="h-[1px] w-12 bg-accent"></div>
            <span className="text-micro text-accent tracking-[0.2em]">OUR STORY</span>
          </div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-6xl sm:text-9xl font-black tracking-tighter text-primary leading-[0.85] heading-display uppercase"
          >
            Global <br />
            <span className="text-muted/30 italic font-serif lowercase">Logistics</span> <br />
            Redefined.
          </motion.h1>
        </div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col gap-8 pb-4"
        >
          <p className="text-xl sm:text-2xl text-muted leading-relaxed font-medium max-w-xl">
            SwiftTrack was founded with a single goal: to bring transparency and security to the global logistics industry. Today, we handle thousands of high-value consignments daily across 150+ countries.
          </p>
          <div className="flex items-center gap-6 text-primary font-black text-sm tracking-widest uppercase group cursor-pointer">
            <span>Learn more about our mission</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
          </div>
        </motion.div>
      </section>

      {/* Stats Section - Technical Grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 border-y border-primary/10">
        {[
          { label: "ESTABLISHED", value: "2010" },
          { label: "GLOBAL HUBS", value: "24" },
          { label: "COUNTRIES", value: "150+" },
          { label: "CONSIGNMENTS", value: "1M+" }
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            viewport={{ once: true }}
            className="p-12 flex flex-col gap-4 border-r last:border-r-0 border-primary/10 hover:bg-primary/[0.02] transition-colors"
          >
            <span className="text-micro text-muted font-mono">{stat.label}</span>
            <span className="text-5xl sm:text-7xl font-black text-primary heading-display tracking-tighter">{stat.value}</span>
          </motion.div>
        ))}
      </section>

      {/* Detailed Content - Technical Split */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
        <div className="flex flex-col gap-16">
          <div className="flex flex-col gap-8">
            <h2 className="text-5xl sm:text-7xl font-black tracking-tighter text-primary heading-display uppercase leading-[0.9]">
              The <span className="text-accent">SwiftTrack</span> <br />
              Advantage.
            </h2>
            <p className="text-lg text-muted leading-relaxed font-medium max-w-xl">
              In an era of global uncertainty, the security of your high-value items is paramount. We don't just move boxes; we manage assets. Our infrastructure is built on 256-bit encryption, 24/7 physical monitoring, and a network of certified global partners.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
            <div className="flex flex-col gap-6 p-8 border border-primary/5 hover:border-accent/30 transition-colors group">
              <div className="w-14 h-14 bg-primary text-white flex items-center justify-center group-hover:bg-accent transition-colors">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div className="flex flex-col gap-2">
                <h4 className="font-black text-lg uppercase tracking-tight heading-display">TAPA Certified</h4>
                <p className="text-sm text-muted leading-relaxed">Highest security standards in the industry, ensuring your assets are protected at every stage.</p>
              </div>
            </div>
            <div className="flex flex-col gap-6 p-8 border border-primary/5 hover:border-accent/30 transition-colors group">
              <div className="w-14 h-14 bg-primary text-white flex items-center justify-center group-hover:bg-accent transition-colors">
                <Globe className="w-7 h-7" />
              </div>
              <div className="flex flex-col gap-2">
                <h4 className="font-black text-lg uppercase tracking-tight heading-display">Global Reach</h4>
                <p className="text-sm text-muted leading-relaxed">Seamless delivery to even the most remote locations through our extensive partner network.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="relative aspect-square bg-primary p-12 overflow-hidden group">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-accent/40 via-transparent to-transparent"></div>
          </div>
          <div className="relative h-full border border-white/10 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              className="text-white/5"
            >
              <Globe className="w-[150%] h-[150%]" />
            </motion.div>
            <div className="absolute inset-0 flex items-center justify-center p-20">
              <div className="w-full h-full border border-white/10 rounded-full flex items-center justify-center relative">
                <div className="absolute inset-0 bg-accent/10 blur-3xl rounded-full"></div>
                <Package className="w-24 h-24 text-accent relative z-10" />
                <motion.div 
                  animate={{ rotate: -360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0"
                >
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-accent rounded-full shadow-[0_0_20px_rgba(255,95,31,0.8)]"></div>
                </motion.div>
              </div>
            </div>
          </div>
          <div className="absolute bottom-12 left-12 right-12 flex justify-between items-end">
            <div className="flex flex-col gap-1">
              <span className="text-micro text-white/40 font-mono">SYSTEM STATUS</span>
              <span className="text-sm font-black text-white tracking-widest uppercase">OPTIMAL</span>
            </div>
            <div className="flex flex-col gap-1 text-right">
              <span className="text-micro text-white/40 font-mono">NETWORK LOAD</span>
              <span className="text-sm font-black text-white tracking-widest uppercase">14.2%</span>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section - Dark Technical */}
      <section className="bg-primary text-white py-32 px-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5">
          <span className="text-[30vw] font-black leading-none heading-display uppercase select-none">VALUES.</span>
        </div>
        <div className="max-w-6xl mx-auto relative z-10 flex flex-col gap-24">
          <div className="flex flex-col gap-6 max-w-2xl">
            <span className="text-micro text-accent tracking-[0.2em]">OUR CORE VALUES</span>
            <h2 className="text-5xl sm:text-7xl font-black tracking-tighter heading-display uppercase leading-none">
              The SwiftTrack <br />
              <span className="text-white/30 italic font-serif lowercase">Standard</span>.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: <ShieldCheck />, title: "Integrity", desc: "We operate with absolute transparency in every transaction, building trust through accountability." },
              { icon: <Clock />, title: "Precision", desc: "Every second counts. We optimize for speed without compromising safety, using advanced routing algorithms." },
              { icon: <Package />, title: "Care", desc: "We treat every consignment as if it were our own, with specialized handling for high-value assets." }
            ].map((value, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="flex flex-col gap-8 p-10 border border-white/10 hover:border-accent/50 transition-colors group"
              >
                <div className="text-accent group-hover:scale-110 transition-transform duration-500">
                  {React.cloneElement(value.icon as React.ReactElement, { className: "w-10 h-10" })}
                </div>
                <div className="flex flex-col gap-4">
                  <h4 className="text-3xl font-black heading-display uppercase tracking-tight">{value.title}</h4>
                  <p className="text-white/60 leading-relaxed font-medium text-lg">{value.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
