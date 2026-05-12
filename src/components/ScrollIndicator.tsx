'use client';
import { motion } from 'framer-motion';

export default function ScrollIndicator() {
  return (
    <div className="h-24 w-[1px] bg-white/20 relative">
      <motion.div 
        animate={{ y: [0, 80, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 left-0 w-full h-8 bg-brand-accent"
      />
    </div>
  );
}
