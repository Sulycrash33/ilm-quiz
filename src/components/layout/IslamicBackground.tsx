"use client";

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export function IslamicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Dynamic pattern size based on window dimensions
  const getPatternSize = () => {
    if (typeof window === 'undefined') return 100;
    const baseSize = Math.min(window.innerWidth, window.innerHeight) * 0.15;
    return Math.max(100, Math.min(baseSize, 150)); // Constrain between 100-150px
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawPattern = () => {
      const size = getPatternSize();
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Using theme colors for the pattern
      const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary');
      const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent');
      
      const primaryHSL = `hsl(${primaryColor})`;
      
      ctx.strokeStyle = `hsla(${primaryColor}, 0.3)`;
      ctx.lineWidth = 0.5;

      const patternSize = size;
      for (let x = 0; x < canvas.width; x += patternSize) {
        for (let y = 0; y < canvas.height; y += patternSize) {
          ctx.beginPath();
          for (let i = 0; i < 8; i++) {
            const angle = (Math.PI / 4) * i;
            const outerRadius = patternSize / 2;
            const innerRadius = patternSize / 4;
            const outerX = x + patternSize / 2 + Math.cos(angle) * outerRadius;
            const outerY = y + patternSize / 2 + Math.sin(angle) * outerRadius;
            const innerX = x + patternSize / 2 + Math.cos(angle + Math.PI / 8) * innerRadius;
            const innerY = y + patternSize / 2 + Math.sin(angle + Math.PI / 8) * innerRadius;
            ctx.lineTo(outerX, outerY);
            ctx.lineTo(innerX, innerY);
          }
          ctx.closePath();
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(x + patternSize / 2, y + patternSize / 2, patternSize / 3, 0, Math.PI * 2);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(x + patternSize / 4, y + patternSize / 4);
          ctx.lineTo(x + (3 * patternSize) / 4, y + (3 * patternSize) / 4);
          ctx.moveTo(x + (3 * patternSize) / 4, y + patternSize / 4);
          ctx.lineTo(x + patternSize / 4, y + (3 * patternSize) / 4);
          ctx.stroke();
        }
      }
    };

    drawPattern();
    const handleResize = () => drawPattern();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const floatVariants = {
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.2, 0.4, 0.2],
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 opacity-20"
        style={{ filter: 'blur(1px)' }}
      />
      <motion.div
        className="absolute top-20 left-10 w-2 h-2 bg-primary/50 rounded-full"
        variants={floatVariants}
        animate="animate"
      />
      <motion.div
        className="absolute top-40 right-20 w-1.5 h-1.5 bg-accent/60 rounded-full"
        variants={floatVariants}
        animate="animate"
        transition={{ delay: 2, duration: 10 }}
      />
      <motion.div
        className="absolute bottom-32 left-1/4 w-2.5 h-2.5 bg-primary/60 rounded-full"
        variants={floatVariants}
        animate="animate"
        transition={{ delay: 4, duration: 7 }}
      />
      <motion.div
        className="absolute bottom-20 right-1/3 w-1 h-1 bg-accent/50 rounded-full"
        variants={floatVariants}
        animate="animate"
        transition={{ delay: 6, duration: 9 }}
      />
    </div>
  );
}