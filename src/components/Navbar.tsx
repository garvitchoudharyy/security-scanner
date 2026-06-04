"use client";

/**
 * NAVBAR COMPONENT
 * ================
 * Top navigation bar with cyber styling.
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Menu, X, Activity, Lock, FileSearch } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "#scanner", label: "Scanner", icon: FileSearch },
    { href: "#how-it-works", label: "How It Works", icon: Activity },
    { href: "#features", label: "Features", icon: Lock },
  ];

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass-strong border-b border-cyber-border"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="w-8 h-8 bg-cyan-500/10 border border-cyan-500/30 rounded flex items-center justify-center group-hover:border-cyan-500/60 transition-colors">
                <Shield className="w-4 h-4 text-cyan-400" />
              </div>
              {/* Glow dot */}
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            </div>
            <div>
              <span className="font-orbitron font-bold text-sm text-cyan-400 text-glow-cyan tracking-wider">
                SECURE
              </span>
              <span className="font-orbitron font-bold text-sm text-white tracking-wider">
                SCAN
              </span>
              <span className="font-mono text-xs text-cyan-400/60 ml-1">PRO</span>
            </div>
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <a
                key={href}
                href={href}
                className="flex items-center gap-1.5 text-xs font-mono text-cyber-muted hover:text-cyan-400 transition-colors uppercase tracking-wider group"
              >
                <Icon className="w-3 h-3 group-hover:text-cyan-400 transition-colors" />
                {label}
              </a>
            ))}
          </div>

          {/* CTA button */}
          <div className="hidden md:block">
            <a
              href="#scanner"
              className="btn-cyber btn-cyber-primary text-xs py-2 px-4"
            >
              <Shield className="w-3 h-3" />
              Scan Now — Free
            </a>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-cyber-muted hover:text-cyan-400 transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden glass-strong border-t border-cyber-border"
        >
          <div className="px-4 py-4 space-y-3">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <a
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 text-sm font-mono text-cyber-muted hover:text-cyan-400 transition-colors py-2"
              >
                <Icon className="w-4 h-4" />
                {label}
              </a>
            ))}
            <a
              href="#scanner"
              onClick={() => setMobileOpen(false)}
              className="btn-cyber btn-cyber-primary w-full justify-center mt-2 text-xs"
            >
              Scan Now — Free
            </a>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}

