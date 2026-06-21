import React from 'react';
import { motion } from 'framer-motion';

export default function ScrollReveal({ children, delay = 0, duration = 0.8, direction = 'up', scale = 1, className = "" }) {
  const getVariants = () => {
    switch (direction) {
      case 'up':
        return { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } };
      case 'down':
        return { hidden: { opacity: 0, y: -40 }, visible: { opacity: 1, y: 0 } };
      case 'left':
        return { hidden: { opacity: 0, x: 40 }, visible: { opacity: 1, x: 0 } };
      case 'right':
        return { hidden: { opacity: 0, x: -40 }, visible: { opacity: 1, x: 0 } };
      case 'fade':
        return { hidden: { opacity: 0 }, visible: { opacity: 1 } };
      default:
        return { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } };
    }
  };

  const variants = getVariants();
  if (scale !== 1) {
    variants.hidden.scale = scale;
    variants.visible.scale = 1;
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
}
