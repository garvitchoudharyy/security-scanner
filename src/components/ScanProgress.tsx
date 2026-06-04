"use client";

/**
 * SCAN PROGRESS COMPONENT
 * ========================
 * Animated loading screen shown while scanning is in progress.
 * Shows a terminal-style output with fake progress steps.
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Terminal, Wifi } from "lucide-react";
import { getScanMessages } from "@/utils/helpers";

interface ScanProgressProps {
  url: string;
}

export default function ScanProgress({ url }: ScanProgressProps) {
  const messages = getScanMessages();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Cycle through messages over ~12 seconds
    const totalTime = 12000;
    const intervalTime = totalTime / messages.length;

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        const next = prev + 1;
        if (next < messages.length) {
          setCompletedSteps((c) => [...c, prev]);
          setProgress(Math.round((next / messages.length) * 95));
          return next;
        }
        return prev;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-2xl mx-auto"
    >
      {/* Scan line animation at top */}
      <div className="scan-line-animation" />

      {/* Main card */}
      <div className="glass rounded-xl border border-cyan-500/20 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-cyber-border bg-cyber-card/50">
          {/* Animated shield */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 relative"
          >
            <div className="absolute inset-0 rounded-full border border-cyan-500/30" />
            <div className="absolute inset-1 rounded-full border border-cyan-500/20" />
            <Shield className="absolute inset-0 m-auto w-4 h-4 text-cyan-400" />
          </motion.div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-cyan-400 uppercase tracking-wider">
                Scanning in progress
              </span>
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1 h-1 rounded-full bg-cyan-400"
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </div>
            <div className="text-xs text-cyber-muted mt-0.5 font-mono truncate">
              Target: {url}
            </div>
          </div>

          {/* Live indicator */}
          <div className="flex items-center gap-1.5">
            <Wifi className="w-3 h-3 text-cyan-400" />
            <span className="text-xs font-mono text-cyan-400">LIVE</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-cyber-muted">Progress</span>
            <span className="text-xs font-mono text-cyan-400">{progress}%</span>
          </div>
          <div className="h-1.5 bg-cyber-card rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full relative overflow-hidden"
              style={{
                background: "linear-gradient(90deg, #00d4ff, #00ff88)",
              }}
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            >
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            </motion.div>
          </div>
        </div>

        {/* Terminal output */}
        <div className="px-6 py-4">
          <div className="flex items-center gap-2 mb-3">
            <Terminal className="w-3 h-3 text-cyber-muted" />
            <span className="text-xs font-mono text-cyber-muted uppercase tracking-wider">
              Scan Log
            </span>
          </div>

          <div className="bg-cyber-bg/80 rounded-lg border border-cyber-border p-4 font-mono text-xs space-y-2 max-h-56 overflow-y-auto">
            <AnimatePresence>
              {messages.map((msg, i) => {
                if (i > currentStep + 1) return null; // Only show up to current + 1

                const isCompleted = completedSteps.includes(i);
                const isCurrent = i === currentStep;

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex items-center gap-2 ${
                      isCompleted
                        ? "text-emerald-400/70"
                        : isCurrent
                        ? "text-cyan-400"
                        : "text-cyber-muted/40"
                    }`}
                  >
                    {/* Status indicator */}
                    <span className="flex-shrink-0 w-3">
                      {isCompleted ? (
                        <span className="text-emerald-400">✓</span>
                      ) : isCurrent ? (
                        <motion.span
                          animate={{ opacity: [1, 0, 1] }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                          className="text-cyan-400"
                        >
                          ▶
                        </motion.span>
                      ) : (
                        <span className="text-cyber-muted/30">○</span>
                      )}
                    </span>

                    {/* Message */}
                    <span className={isCurrent ? "cursor-blink" : ""}>{msg}</span>

                    {/* Timestamp for completed */}
                    {isCompleted && (
                      <span className="ml-auto text-cyber-muted/40 text-[10px]">
                        OK
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Security check categories being scanned */}
        <div className="px-6 pb-5">
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Headers", done: progress > 20 },
              { label: "SSL/TLS", done: progress > 30 },
              { label: "Cookies", done: progress > 45 },
              { label: "CSP", done: progress > 55 },
              { label: "Robots.txt", done: progress > 65 },
              { label: "Tech Stack", done: progress > 80 },
            ].map(({ label, done }) => (
              <div
                key={label}
                className={`flex items-center gap-1.5 px-2 py-1.5 rounded border text-xs font-mono transition-all duration-500 ${
                  done
                    ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400"
                    : "border-cyber-border bg-cyber-card/30 text-cyber-muted"
                }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${
                    done ? "bg-emerald-400" : "bg-cyber-muted/40"
                  }`}
                />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-center text-xs text-cyber-muted mt-4 font-mono">
        This may take up to 15 seconds. Please do not close this page.
      </p>
    </motion.div>
  );
}

