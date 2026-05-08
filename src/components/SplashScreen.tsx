import React, { useEffect, useState } from 'react';
import { Loader2, Plane, Truck } from 'lucide-react';
import Logo from './Logo';

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center gap-8">
      <div className="flex flex-col items-center gap-4 relative">
        <div className="text-primary">
          <Logo size={80} />
        </div>
        <div className="flex flex-col items-center">
          <h1 className="text-4xl font-black tracking-tighter text-text">SWIFTTRACK</h1>
          <p className="text-sm font-bold text-muted uppercase tracking-[0.3em] ml-1">Consignment Systems</p>
        </div>
      </div>
      
      <div className="absolute bottom-12 flex flex-col items-center gap-4">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Initializing Global Logistics Network</span>
      </div>
    </div>
  );
}
