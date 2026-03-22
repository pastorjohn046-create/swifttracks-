import React from 'react';
import { motion } from 'motion/react';

interface LogoProps {
  className?: string;
  size?: number;
}

export default function Logo({ className = "", size = 24 }: LogoProps) {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Modern "S" / Box Motif */}
        <motion.path
          d="M4 8L12 4L20 8V16L12 20L4 16V8Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
        <motion.path
          d="M4 8L12 12L20 8"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ delay: 0.5, duration: 1, ease: "easeInOut" }}
        />
        <motion.path
          d="M12 12V20"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ delay: 1, duration: 1, ease: "easeInOut" }}
        />
        {/* Stylized "S" inside */}
        <motion.path
          d="M9 10C9 10 10 9 12 9C14 9 15 10 15 11C15 12 14 13 12 13C10 13 9 14 9 15C9 16 10 17 12 17C14 17 15 16 15 16"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
        />
      </svg>
      {/* Speed Lines */}
      <motion.div
        className="absolute -left-2 top-1/2 -translate-y-1/2 flex flex-col gap-1"
        initial={{ x: -10, opacity: 0 }}
        animate={{ x: 0, opacity: 0.4 }}
        transition={{ delay: 2, duration: 0.8 }}
      >
        <div className="w-3 h-0.5 bg-current rounded-full"></div>
        <div className="w-2 h-0.5 bg-current rounded-full"></div>
      </motion.div>
    </div>
  );
}
