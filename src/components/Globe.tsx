import React, { useEffect, useRef } from 'react';
import createGlobe from 'cobe';
import { motion } from 'motion/react';
import { Plane } from 'lucide-react';

export default function Globe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let phi = 0;

    if (!canvasRef.current) return;

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: 600 * 2,
      height: 600 * 2,
      phi: 0,
      theta: 0,
      dark: 0,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [1, 1, 1],
      markerColor: [255 / 255, 95 / 255, 31 / 255],
      glowColor: [1, 1, 1],
      markers: [
        // London
        { location: [51.5074, -0.1278], size: 0.1 },
        // New York
        { location: [40.7128, -74.006], size: 0.1 },
        // Tokyo
        { location: [35.6762, 139.6503], size: 0.1 },
        // Dubai
        { location: [25.2048, 55.2708], size: 0.1 },
      ],
      onRender: (state: any) => {
        state.phi = phi;
        phi += 0.005;
      },
    } as any);

    return () => {
      globe.destroy();
    };
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <canvas
        ref={canvasRef}
        style={{ width: 600, height: 600, maxWidth: '100%', aspectRatio: '1' }}
      />
      
      {/* Animated Airplane Overlay */}
      <motion.div
        className="absolute z-10 text-accent pointer-events-none"
        animate={{
          x: [-200, 200],
          y: [-100, 100],
          rotate: [0, 45],
          opacity: [0, 1, 1, 0],
          scale: [0.5, 1.2, 1.2, 0.5]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Plane className="w-8 h-8 fill-current" />
      </motion.div>

      <motion.div
        className="absolute z-10 text-accent pointer-events-none"
        animate={{
          x: [200, -200],
          y: [100, -100],
          rotate: [180, 225],
          opacity: [0, 1, 1, 0],
          scale: [0.5, 1, 1, 0.5]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4
        }}
      >
        <Plane className="w-6 h-6 fill-current" />
      </motion.div>
    </div>
  );
}
