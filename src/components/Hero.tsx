"use client";

/**
 * HERO SECTION
 * ============
 * Landing page hero with animated background, headline,
 * and the main URL scanner input form.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Search, AlertTriangle, Lock, Zap, Globe } from "lucide-react";
import { isValidUrl } from "@/utils/helpers";

interface HeroProps {
  onScan: (url: string) => void;
  isScanning: boolean;
}

// Floating security stats shown in the hero
const STATS = [
  { label: "Checks Performed", value: "25+", icon: Shield },
  { label: "Headers Analyzed", value: "10+", icon: Lock },
  { label: "Scan Time", value: "<15s", icon: Zap },
  { label: "Free to Use", value: "100%", icon: Globe },
];

export default function Hero({ onScan, isScanning }: HeroProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) {
      setError("Please enter a URL to scan.");
      return;
    }
    if (!isValidUrl(trimmed)) {
      setError("Please enter a valid URL (e.g., example.com or https://example.com)");
      return;
    }
    setError("");
    onScan(trimmed);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSubmit(e as unknown as React.FormEvent);
  }

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16">
      {/* Animated background grid (already on body, add layered glow) */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Large radial gradient for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(0,212,255,0.08),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_80%_80%,rgba(124,58,237,0.05),transparent)]" />

        {/* Animated floating orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-5"
          style={{
            background: "radial-gradient(circle, #00d4ff, transparent 70%)",
          }}
          animate={{ scale: [1, 1.2, 1], x: [0, 20, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-5"
          style={{
            background: "radial-gradient(circle, #7c3aed, transparent 70%)",
          }}
          animate={{ scale: [1, 1.15, 1], x: [0, -15, 0], y: [0, 15, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/5 mb-8"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-mono text-xs text-cyan-400 tracking-wider uppercase">
            Real-time Security Analysis Engine
          </span>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-orbitron text-4xl sm:text-5xl lg:text-6xl font-black mb-6 leading-tight"
        >
          <span className="text-white">SCAN YOUR</span>
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-cyan-300 to-teal-400">
            WEBSITE SECURITY
          </span>
          <br />
          <span className="text-white">IN SECONDS</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-cyber-muted text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Instantly detect vulnerabilities, missing security headers, SSL issues,
          cookie misconfigurations, and more. Get a professional security report with
          actionable fix recommendations — completely free.
        </motion.p>

        {/* Scan Form */}
        <motion.div
          id="scanner"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full max-w-2xl mx-auto"
        >
          <form onSubmit={handleSubmit}>
            <div className="relative group">
              {/* Input wrapper with cyber clip-path style border */}
              <div className="relative flex items-center glass rounded-lg border border-cyan-500/20 group-focus-within:border-cyan-500/50 transition-all duration-300 group-focus-within:shadow-[0_0_30px_rgba(0,212,255,0.15)]">
                {/* Globe icon prefix */}
                <div className="flex-shrink-0 pl-4 pr-3">
                  <Globe className="w-5 h-5 text-cyber-muted group-focus-within:text-cyan-400 transition-colors" />
                </div>

                {/* URL input */}
                <input
                  type="text"
                  value={url}
                  onChange={(e) => { setUrl(e.target.value); setError(""); }}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter website URL (e.g., example.com)"
                  className="flex-1 bg-transparent py-4 pr-2 text-white placeholder-cyber-muted font-mono text-sm outline-none"
                  disabled={isScanning}
                  autoComplete="off"
                  spellCheck={false}
                />

                {/* Scan button */}
                <div className="flex-shrink-0 pr-2">
                  <button
                    type="submit"
                    disabled={isScanning}
                    className="btn-cyber btn-cyber-primary py-2.5 px-5 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isScanning ? (
                      <>
                        <div className="w-3 h-3 border border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
                        Scanning...
                      </>
                    ) : (
                      <>
                        <Search className="w-3.5 h-3.5" />
                        Scan Now
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -bottom-8 left-0 flex items-center gap-1.5 text-xs text-red-400"
                >
                  <AlertTriangle className="w-3 h-3" />
                  {error}
                </motion.div>
              )}
            </div>
          </form>

          {/* Example URLs */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-cyber-muted font-mono">Try:</span>
            {["google.com", "github.com", "wikipedia.org", "shopify.com"].map((site) => (
              <button
                key={site}
                onClick={() => { setUrl(site); setError(""); }}
                disabled={isScanning}
                className="px-2 py-1 rounded border border-cyber-border text-cyber-muted hover:text-cyan-400 hover:border-cyan-500/30 transition-colors font-mono disabled:opacity-50"
              >
                {site}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16 max-w-2xl mx-auto"
        >
          {STATS.map(({ label, value, icon: Icon }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="flex flex-col items-center gap-1 p-3 glass rounded-lg border border-cyber-border"
            >
              <Icon className="w-4 h-4 text-cyan-400 mb-1" />
              <span className="font-orbitron text-lg font-bold text-cyan-400">{value}</span>
              <span className="text-xs text-cyber-muted text-center">{label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-16 flex flex-col items-center gap-2"
        >
          <span className="text-xs text-cyber-muted font-mono uppercase tracking-widest">
            Scroll to learn more
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-4 h-6 border border-cyber-muted/30 rounded-full flex items-start justify-center pt-1"
          >
            <div className="w-1 h-1.5 bg-cyan-400 rounded-full" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

