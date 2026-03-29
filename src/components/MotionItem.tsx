'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface MotionItemProps {
  children: ReactNode;
  delay?: number;
}

export default function MotionItem({ children, delay = 0 }: MotionItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay, ease: [0.19, 1, 0.22, 1] }}
    >
      {children}
    </motion.div>
  );
}
