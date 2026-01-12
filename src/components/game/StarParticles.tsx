"use client";

import React, { useState, useEffect } from 'react';

const StarParticles = ({ count = 20, isEmitting }: { count?: number; isEmitting: boolean }) => {
  const [particles, setParticles] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    if (isEmitting) {
      const newParticles = Array.from({ length: count }).map((_, i) => {
        const style: React.CSSProperties = {
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 0.5}s`,
          transform: `scale(${Math.random() * 0.5 + 0.5})`,
          backgroundColor: `hsl(45, 65%, ${Math.random() * 20 + 42}%)`, // Varying gold shades
        };
        return <div key={i} className="star-particle" style={style} />;
      });
      setParticles(newParticles);
      
      const timer = setTimeout(() => {
        setParticles([]);
      }, 1500); // Clear particles after animation

      return () => clearTimeout(timer);
    }
  }, [isEmitting, count]);

  return <div className="absolute inset-0 pointer-events-none z-20">{particles}</div>;
};

export default StarParticles;
