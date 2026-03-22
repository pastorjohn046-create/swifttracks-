import React, { useEffect, useState } from 'react';
import { Loader2, Plane, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Logo from './Logo';

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center gap-8"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col items-center gap-4 relative"
          >
            {/* Moving Airplane */}
            <motion.div
              initial={{ x: -200, y: -100, opacity: 0 }}
              animate={{ x: 400, y: -200, opacity: [0, 1, 1, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute text-primary/20 pointer-events-none"
            >
              <Plane className="w-12 h-12 rotate-45" />
            </motion.div>

            {/* Moving Truck */}
            <motion.div
              initial={{ x: 300, y: 100, opacity: 0 }}
              animate={{ x: -400, y: 150, opacity: [0, 1, 1, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: 1 }}
              className="absolute text-primary/20 pointer-events-none"
            >
              <Truck className="w-10 h-10" />
            </motion.div>

            <div className="text-primary">
              <Logo size={80} />
            </div>
            <div className="flex flex-col items-center">
              <h1 className="text-4xl font-black tracking-tighter text-text">SWIFTTRACK</h1>
              <p className="text-sm font-bold text-muted uppercase tracking-[0.3em] ml-1">Consignment Systems</p>
            </div>
          </motion.div>
          
          <div className="absolute bottom-12 flex flex-col items-center gap-4">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Initializing Global Logistics Network</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
