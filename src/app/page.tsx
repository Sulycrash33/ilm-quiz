"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

export default function SplashScreen() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    setIsLoaded(true)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 2
      })
    }, 50)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-background overflow-hidden">
      {/* Background Shader Layer */}
      <div className="fixed inset-0 z-0">
        {/* Atmospheric Mesh Overlay */}
        <div className="absolute inset-0 mashrabiya-overlay pointer-events-none" />
        
        {/* Ambient Glow Effects */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute top-1/2 -left-24 w-80 h-80 bg-secondary/5 blur-[100px] rounded-full" />
      </div>

      {/* Main Content */}
      <main className="relative z-10 w-full max-w-lg px-5 flex flex-col items-center justify-center min-h-screen space-y-12">
        {/* Center Logo & Branding Block */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.8 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative flex flex-col items-center"
        >
          {/* Pulse Effect Layers */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-64 rounded-full border border-primary/20 pulse-effect" />
            <div className="absolute w-80 h-80 rounded-full border border-primary/10 pulse-effect" style={{ animationDelay: "1s" }} />
          </div>

          {/* Logo Surface */}
          <motion.div
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative bg-surface-container/40 backdrop-blur-2xl p-6 rounded-full border border-white/10 shadow-[0_10px_40px_-10px_rgba(0,83,219,0.3)] flex flex-col items-center space-y-4"
          >
            {/* Logo Icon */}
            <div className="w-48 h-48 md:w-56 md:h-56 rounded-full bg-gradient-to-br from-primary/20 to-primary-container/20 flex items-center justify-center">
              <svg
                viewBox="0 0 100 100"
                className="w-32 h-32 md:w-40 md:h-40 text-primary"
                fill="currentColor"
              >
                <path d="M50 10 C30 10 15 25 15 45 C15 65 50 90 50 90 C50 90 85 65 85 45 C85 25 70 10 50 10 Z M50 35 C42 35 35 42 35 50 C35 58 42 65 50 65 C58 65 65 58 65 50 C65 42 58 35 50 35 Z" />
                <path d="M50 5 L55 20 L70 15 L60 28 L75 30 L62 38 L75 48 L60 45 L65 60 L50 50 L35 60 L40 45 L25 48 L38 38 L25 30 L40 28 L30 15 L45 20 Z" opacity="0.3" />
              </svg>
            </div>

            {/* Brand Text */}
            <div className="text-center pt-1">
              <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary tracking-tight">
                ILM Hunt
              </h1>
              <div className="flex items-center justify-center gap-1 mt-1 text-on-surface-variant/70">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z" />
                </svg>
                <span className="font-label-caps text-label-caps uppercase tracking-widest">
                  Digital Sanctuary
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Progress Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col items-center space-y-2"
        >
          <div className="relative w-48 h-1 bg-surface-variant/30 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
              className="absolute top-0 left-0 h-full bg-primary shadow-[0_0_10px_rgba(78,222,163,0.5)] rounded-full"
            />
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant/50">
            Purifying the intent...
          </p>
        </motion.div>

        {/* Get Started Button */}
        <AnimatePresence>
          {progress >= 100 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center space-y-4"
            >
              <Link
                href="/language"
                className="btn-primary px-10 py-4 text-lg font-bold rounded-full shadow-lg glow-effect haptic-feedback"
              >
                Begin Your Journey
              </Link>
              <p className="text-sm text-on-surface-variant">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-primary hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Quote Block */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="fixed bottom-12 left-0 right-0 px-5 text-center"
        >
          <div className="max-w-md mx-auto space-y-1">
            <svg
              className="w-5 h-5 mx-auto mb-2 text-tertiary-fixed-dim/40"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
            </svg>
            <blockquote className="font-quote-italic text-quote-italic text-on-surface/90 italic leading-relaxed">
              &quot;Seek knowledge from the cradle to the grave.&quot;
            </blockquote>
            <div className="w-8 h-px bg-primary/20 mx-auto mt-4" />
          </div>
        </motion.div>
      </main>

      {/* Interactive Atmosphere Script */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            // Simple parallax for the logo based on mouse movement
            document.addEventListener('mousemove', (e) => {
              const logo = document.querySelector('.logo-container');
              if (logo) {
                const moveX = (e.clientX - window.innerWidth / 2) / 50;
                const moveY = (e.clientY - window.innerHeight / 2) / 50;
                logo.style.transform = \`translate(\${moveX}px, \${moveY}px)\`;
              }
            });

            // Add haptic feedback simulation
            document.querySelectorAll('a, button').forEach(el => {
              el.addEventListener('touchstart', () => {
                if ('vibrate' in navigator) {
                  navigator.vibrate(10);
                }
              });
            });
          `,
        }}
      />
    </div>
  )
}
