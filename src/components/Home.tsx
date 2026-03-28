import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, ArrowRight, ShieldCheck, Clock, Globe, CheckCircle2, Plane, Truck, Bus, Ship, Star, Search, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

const GlobeWithPlane = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Radar Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 2, opacity: [0, 0.2, 0] }}
            transition={{ duration: 4, repeat: Infinity, delay: i * 1.3, ease: "easeOut" }}
            className="absolute w-64 h-64 border border-primary/20 rounded-full"
          />
        ))}
      </div>

      {/* Globe Container */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="relative w-64 h-64 sm:w-96 sm:h-96 rounded-full border border-primary/10 flex items-center justify-center bg-white/5 shadow-[0_0_50px_rgba(0,0,0,0.05)]"
      >
        {/* Globe Lines */}
        <div className="absolute inset-0 rounded-full border border-primary/5 rotate-45"></div>
        <div className="absolute inset-0 rounded-full border border-primary/5 -rotate-45"></div>
        <div className="absolute inset-0 rounded-full border border-primary/5 scale-x-50"></div>
        <div className="absolute inset-0 rounded-full border border-primary/5 scale-y-50"></div>
        
        <Globe className="w-32 h-32 sm:w-48 sm:h-48 text-primary/10" />
      </motion.div>

      {/* Airplane Animation */}
      <motion.div
        initial={{ x: -200, y: 100, opacity: 0, rotate: -45 }}
        animate={{ 
          x: [ -200, 0, 200 ], 
          y: [ 100, -100, -200 ],
          opacity: [ 0, 1, 0 ],
          rotate: [ -45, -15, 15 ]
        }}
        transition={{ 
          duration: 8, 
          repeat: Infinity, 
          ease: "easeInOut",
          times: [0, 0.5, 1]
        }}
        className="absolute z-20 text-accent"
      >
        <Plane className="w-12 h-12 fill-accent" />
      </motion.div>

      {/* Second Airplane for variety */}
      <motion.div
        initial={{ x: 200, y: 200, opacity: 0, rotate: 135 }}
        animate={{ 
          x: [ 200, 0, -200 ], 
          y: [ 200, 0, -100 ],
          opacity: [ 0, 1, 0 ],
          rotate: [ 135, 165, 195 ]
        }}
        transition={{ 
          duration: 10, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 4,
          times: [0, 0.5, 1]
        }}
        className="absolute z-20 text-primary/40"
      >
        <Plane className="w-8 h-8" />
      </motion.div>

      {/* Glow Effect */}
      <div className="absolute inset-0 bg-accent/5 blur-[100px] rounded-full -z-10"></div>
    </div>
  );
};

export default function Home({ user }: { user?: any }) {
  const [trackingId, setTrackingId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleTrack = (e: FormEvent) => {
    e.preventDefault();
    if (!trackingId.trim()) return;
    setIsSubmitting(true);
    // Navigate to tracking page with the ID
    navigate(`/track?id=${trackingId.trim().toUpperCase()}`);
  };

  return (
    <div className="flex flex-col relative overflow-hidden bg-atmosphere">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <motion.div
          initial={{ x: -100, y: '10%', opacity: 0 }}
          animate={{ x: '120vw', y: '15%', opacity: [0, 0.1, 0.1, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute text-primary/10"
        >
          <Plane className="w-16 h-16 rotate-12" />
        </motion.div>
      </div>

      {/* Hero Section - Split Layout */}
      <section className="min-h-screen flex flex-col lg:flex-row border-b border-border">
        <div className="flex-1 flex flex-col justify-center p-8 sm:p-16 lg:p-24 border-r border-border">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="section-label mb-12"
          >
            Global Logistics Excellence
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-7xl sm:text-8xl lg:text-[10vw] font-black text-primary heading-display mb-12"
          >
            SECURE <br />
            <span className="text-accent italic">SYSTEMS.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg sm:text-xl text-muted max-w-lg leading-relaxed font-medium mb-12"
          >
            SwiftTrack provides professional-grade tracking and management for high-value consignments. Precision engineering for the modern supply chain.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link to="/track" className="btn-primary">
              Track Shipment <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to={user ? "/dashboard" : "/login"} className="btn-secondary">
              Get Started
            </Link>
          </motion.div>
        </div>

        <div className="flex-1 relative bg-white flex items-center justify-center p-12 overflow-hidden">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="w-full h-full max-w-2xl aspect-square"
          >
            <GlobeWithPlane />
          </motion.div>
          
          {/* Technical Overlay */}
          <div className="absolute top-12 right-12 text-right hidden sm:block">
            <div className="text-[10px] font-mono text-muted uppercase tracking-[0.3em] mb-2">System Status</div>
            <div className="flex items-center justify-end gap-2 text-xs font-bold text-primary">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              OPERATIONAL / 24.03.2026
            </div>
          </div>

          <div className="absolute bottom-12 left-12 hidden sm:block">
            <div className="text-[10px] font-mono text-muted uppercase tracking-[0.3em] mb-2">Network Load</div>
            <div className="h-1 w-48 bg-border overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "75%" }}
                transition={{ duration: 2, delay: 1 }}
                className="h-full bg-accent"
              ></motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Track - Integrated Technical Bar */}
      <section className="bg-white border-b border-border py-12 px-8 sm:px-16 lg:px-24">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="flex flex-col gap-2 min-w-[300px]">
            <span className="section-label">Self Service</span>
            <h2 className="text-3xl font-bold heading-display italic">Quick Track.</h2>
          </div>
          <form 
            onSubmit={handleTrack}
            className="flex-1 w-full flex flex-col sm:flex-row gap-1"
          >
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input 
                type="text"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                placeholder="ENTER TRACKING ID (E.G. ST-XXXX-XX)"
                className="input-modern pl-12"
              />
            </div>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="btn-primary min-w-[200px]"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Track Now"}
            </button>
          </form>
        </div>
      </section>

      {/* Features - Technical Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 bg-border gap-[1px] border-b border-border">
        {[
          { label: "Security", title: "SECURE STORAGE.", desc: "Your consignments are stored in high-security facilities with 24/7 monitoring.", icon: ShieldCheck },
          { label: "Technology", title: "REAL-TIME DATA.", desc: "Get instant notifications and detailed logs of every movement in your shipment's journey.", icon: Clock },
          { label: "Network", title: "GLOBAL REACH.", desc: "Our logistics network spans 150+ countries, ensuring your items reach their destination safely.", icon: Globe }
        ].map((feature, i) => (
          <div key={i} className="bg-white p-12 sm:p-16 flex flex-col gap-8 group hover:bg-bg transition-colors">
            <span className="section-label">{feature.label}</span>
            <h3 className="text-3xl font-bold heading-display">{feature.title}</h3>
            <p className="text-muted leading-relaxed font-medium">{feature.desc}</p>
            <div className="w-12 h-12 border border-border flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
              <feature.icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </section>

      {/* About Us - Editorial Split */}
      <section className="flex flex-col lg:flex-row border-b border-border">
        <div className="flex-1 p-8 sm:p-16 lg:p-24 border-r border-border">
          <div className="flex flex-col gap-12">
            <div className="flex flex-col gap-6">
              <span className="section-label">Our Heritage</span>
              <h2 className="text-6xl md:text-8xl font-black text-primary heading-display">EST. 2010.</h2>
              <p className="text-xl text-muted leading-relaxed font-medium">
                SwiftTrack has grown from a local courier service to a global logistics powerhouse. We specialize in high-value, time-sensitive consignments.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
              <div className="flex flex-col gap-4">
                <h4 className="font-bold text-lg heading-display">Our Mission</h4>
                <p className="text-muted text-sm font-medium leading-relaxed">To provide the world's most secure and transparent logistics infrastructure for high-value goods.</p>
              </div>
              <div className="flex flex-col gap-4">
                <h4 className="font-bold text-lg heading-display">Our Vision</h4>
                <p className="text-muted text-sm font-medium leading-relaxed">A world where global trade is seamless, secure, and accessible to everyone, everywhere.</p>
              </div>
            </div>
            <Link to="/about" className="btn-secondary self-start">
              Full Story <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        <div className="flex-1 bg-white p-12 flex items-center justify-center relative overflow-hidden">
          <div className="w-full h-full max-w-lg aspect-square relative">
            <img 
              src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=1000" 
              alt="Warehouse" 
              className="w-full h-full object-cover grayscale opacity-20"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 border border-border m-8"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-24 h-24 bg-primary flex items-center justify-center text-white">
                <Globe className="w-10 h-10 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process - Dark Technical Section */}
      <section className="bg-primary text-white py-24 px-8 sm:px-16 lg:px-24">
        <div className="flex flex-col lg:flex-row justify-between items-end gap-12 mb-24">
          <div className="flex flex-col gap-6">
            <span className="section-label !text-accent">Process</span>
            <h2 className="text-6xl md:text-9xl font-black heading-display italic">LOGISTICS.</h2>
          </div>
          <p className="text-xl text-white/40 max-w-xs font-medium">A simple, transparent process for all your logistics needs.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 bg-white/10 gap-[1px] border border-white/10">
          {[
            { step: "01", title: "BOOK", desc: "Create a shipment request through our intuitive dashboard." },
            { step: "02", title: "PICKUP", desc: "Our couriers collect your package from your preferred location." },
            { step: "03", title: "TRANSIT", desc: "Monitor your package in real-time as it moves through our hubs." },
            { step: "04", title: "DELIVER", desc: "Safe and secure delivery to the final destination." }
          ].map((item, i) => (
            <div key={i} className="bg-primary p-12 flex flex-col gap-12 hover:bg-white/5 transition-colors">
              <span className="text-5xl font-black text-white/10 heading-display">{item.step}</span>
              <div className="flex flex-col gap-4">
                <h4 className="text-xl font-bold heading-display tracking-widest">{item.title}</h4>
                <p className="text-xs text-white/40 font-medium leading-relaxed uppercase tracking-wider">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Reviews - Editorial Grid */}
      <section className="py-24 px-8 sm:px-16 lg:px-24 border-b border-border">
        <div className="flex flex-col md:flex-row justify-between items-end gap-12 mb-24">
          <div className="flex flex-col gap-6">
            <span className="section-label">Testimonials</span>
            <h2 className="text-6xl md:text-8xl font-black text-primary heading-display italic">TRUSTED.</h2>
          </div>
          <Link to="/reviews" className="btn-secondary">
            All Reviews <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 bg-border gap-[1px] border border-border">
          {[
            { name: "Robert Chen", role: "Logistics Director", text: "SwiftTrack has revolutionized how we manage our high-value electronics shipments. The real-time visibility is unmatched.", rating: 5 },
            { name: "Sarah Jenkins", role: "E-commerce Founder", text: "The most reliable logistics partner we've ever worked with. Their customer support is proactive and extremely helpful.", rating: 5 },
            { name: "Marcus Thorne", role: "Global Operations", text: "Security was our main concern for luxury goods. SwiftTrack's secure storage and tracking gave us complete peace of mind.", rating: 5 }
          ].map((review, i) => (
            <div key={i} className="bg-white p-12 flex flex-col gap-12 hover:bg-bg transition-colors">
              <div className="flex gap-1">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 text-accent fill-accent" />
                ))}
              </div>
              <p className="text-2xl font-medium text-primary leading-tight heading-display italic">"{review.text}"</p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 border border-border flex items-center justify-center text-primary font-black text-[10px]">
                  {review.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-primary text-xs uppercase tracking-widest">{review.name}</span>
                  <span className="text-[10px] text-muted font-mono uppercase">{review.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA - Full Screen Split */}
      <section className="flex flex-col lg:flex-row bg-primary text-white">
        <div className="flex-1 p-12 sm:p-24 flex flex-col justify-center gap-12 border-r border-white/10">
          <span className="section-label !text-accent">Get Started</span>
          <h2 className="text-6xl sm:text-8xl font-black heading-display italic leading-[0.85]">
            READY TO <br /> SHIP?
          </h2>
          <p className="text-white/40 text-xl max-w-md font-medium">
            Join thousands of global businesses who trust SwiftTrack for their high-value logistics and supply chain management.
          </p>
          <Link to="/login" className="btn-primary !bg-white !text-primary hover:!bg-accent hover:!text-white self-start">
            CREATE ACCOUNT
          </Link>
        </div>
        <div className="flex-1 relative min-h-[400px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-10 flex items-center justify-center">
            <div className="text-[20vw] font-black heading-display italic select-none">SWIFT</div>
          </div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
            className="w-[150%] aspect-square border border-white/5 rounded-full"
          ></motion.div>
        </div>
      </section>
    </div>

  );
}
