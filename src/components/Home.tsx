import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, ArrowRight, ShieldCheck, Clock, Globe, Search, Loader2, Plane, Truck } from 'lucide-react';
import { motion } from 'motion/react';

const GlobeWithPlane = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
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

      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="relative w-64 h-64 sm:w-96 sm:h-96 rounded-full border border-primary/10 flex items-center justify-center bg-white/5 shadow-[0_0_50px_rgba(0,0,0,0.05)]"
      >
        <Globe className="w-32 h-32 sm:w-48 sm:h-48 text-primary/10" />
      </motion.div>

      <motion.div
        initial={{ x: -200, y: 100, opacity: 0, rotate: -45 }}
        animate={{ x: [ -200, 0, 200 ], y: [ 100, -100, -200 ], opacity: [ 0, 1, 0 ] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute z-20 text-accent"
      >
        <Plane className="w-12 h-12 fill-accent" />
      </motion.div>
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
    navigate(`/track?id=${trackingId.trim().toUpperCase()}`);
  };

  return (
    <div className="flex flex-col relative overflow-hidden bg-[#F8F9FA] bg-atmosphere">
      <section className="min-h-screen flex flex-col lg:flex-row border-b border-border">
        <div className="flex-1 flex flex-col justify-center p-8 sm:p-16 lg:p-24 border-r border-border">
          <div className="section-label mb-12">Global Logistics Excellence</div>
          <h1 className="text-7xl sm:text-8xl lg:text-[10vw] font-black text-primary heading-display mb-12">
            SECURE <br />
            <span className="text-accent italic">SYSTEMS.</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted max-w-lg leading-relaxed font-medium mb-12">
            SwiftTrack provides professional-grade tracking and management for high-value consignments. Precision engineering for the modern supply chain.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/track" className="btn-primary">
              Track Shipment <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to={user ? "/dashboard" : "/login"} className="btn-secondary">
              Get Started
            </Link>
          </div>
        </div>

        <div className="flex-1 relative bg-white flex items-center justify-center p-12 overflow-hidden">
          <div className="w-full h-full max-w-2xl aspect-square">
            <GlobeWithPlane />
          </div>
        </div>
      </section>

      <section className="bg-white border-b border-border py-12 px-8 sm:px-16 lg:px-24">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="flex flex-col gap-2 min-w-[300px]">
            <span className="section-label">Self Service</span>
            <h2 className="text-3xl font-bold heading-display italic">Quick Track.</h2>
          </div>
          <form onSubmit={handleTrack} className="flex-1 w-full flex flex-col sm:flex-row gap-1">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input 
                type="text"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                placeholder="ENTER TRACKING ID"
                className="input-modern pl-12"
              />
            </div>
            <button type="submit" disabled={isSubmitting} className="btn-primary min-w-[200px]">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Track Now"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
