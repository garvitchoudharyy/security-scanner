"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Menu, X } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass-strong border-b border-cyber-border" : "bg-transparent"
      }`}
    >
      <div className="w-full px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <a href="#" className="flex items-center gap-2 group flex-shrink-0">
            <div className="relative">
              <div className="w-7 h-7 bg-cyan-500/10 border border-cyan-500/30 rounded flex items-center justify-center">
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
            </div>
            <div className="flex items-baseline gap-0">
              <span className="font-orbitron font-bold text-sm text-cyan-400 tracking-wider">
                SECURE
              </span>
              <span className="font-orbitron font-bold text-sm text-white tracking-wider">
                SCAN
              </span>
              <span className="font-mono text-[10px] text-cyan-400/60 ml-1">PRO</span>
            </div>
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            {[
              { href: "#scanner", label: "Scanner" },
              { href: "#how-it-works", label: "How It Works" },
              { href: "#features", label: "Features" },
            ].map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="text-xs font-mono text-cyber-muted hover:text-cyan-400 transition-colors uppercase tracking-wider"
              >
                {label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:block flex-shrink-0">
            <a
              href="#scanner"
              className="flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-xs uppercase tracking-wider rounded px-4 py-2 hover:bg-cyan-500/20 transition-all"
            >
              <Shield className="w-3 h-3" />
              Scan Now
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-cyber-muted hover:text-cyan-400 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden glass-strong border-t border-cyber-border"
        >
          <div className="px-4 py-4 space-y-1">
            {[
              { href: "#scanner", label: "Scanner" },
              { href: "#how-it-works", label: "How It Works" },
              { href: "#features", label: "Features" },
            ].map(({ href, label }) => (
              <a
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="block py-2.5 text-sm font-mono text-cyber-muted hover:text-cyan-400 transition-colors border-b border-cyber-border/50 last:border-0"
              >
                {label}
              </a>
            ))}
            <a
              href="#scanner"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 mt-3 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-sm uppercase tracking-wider rounded py-2.5 hover:bg-cyan-500/20 transition-all"
            >
              <Shield className="w-4 h-4" />
              Scan Now — Free
            </a>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
