"use client";

/**
 * FEATURES SECTION
 * ================
 * Grid of feature cards showcasing all security checks performed.
 */

import { motion } from "framer-motion";
import {
  Lock, Shield, Cookie, Eye, FileSearch, Globe,
  Code, AlertTriangle, Server, FileText, Mail,
  CheckCircle, Wifi, Database, Zap, BarChart3
} from "lucide-react";

const FEATURES = [
  {
    icon: Lock,
    title: "SSL/TLS Certificate Check",
    description: "Verifies HTTPS is active and analyzes transport layer security.",
    color: "#00ff88",
  },
  {
    icon: Shield,
    title: "Security Headers Analysis",
    description: "Checks 8+ critical HTTP security headers against OWASP standards.",
    color: "#00d4ff",
  },
  {
    icon: Eye,
    title: "Content Security Policy",
    description: "Analyzes CSP directives and flags dangerous values like unsafe-inline.",
    color: "#7c3aed",
  },
  {
    icon: Zap,
    title: "Clickjacking Detection",
    description: "Tests for X-Frame-Options and frame-ancestors CSP directive.",
    color: "#ffaa00",
  },
  {
    icon: Cookie,
    title: "Cookie Security Audit",
    description: "Verifies Secure, HttpOnly, and SameSite flags on all cookies.",
    color: "#ff6400",
  },
  {
    icon: Wifi,
    title: "HTTPS Enforcement",
    description: "Tests HTTP-to-HTTPS redirect and HSTS header configuration.",
    color: "#00d4ff",
  },
  {
    icon: Server,
    title: "Server Info Exposure",
    description: "Detects version disclosure via Server and X-Powered-By headers.",
    color: "#ff3366",
  },
  {
    icon: Code,
    title: "Technology Detection",
    description: "Fingerprints 20+ technologies from headers and page source patterns.",
    color: "#00ff88",
  },
  {
    icon: FileText,
    title: "Robots.txt Analysis",
    description: "Scans robots.txt for sensitive path disclosures to crawlers.",
    color: "#ffaa00",
  },
  {
    icon: Globe,
    title: "Sitemap Discovery",
    description: "Checks for sitemap.xml availability and indexes found URLs.",
    color: "#7c3aed",
  },
  {
    icon: Mail,
    title: "Email Exposure Detection",
    description: "Extracts email addresses visible in page source code.",
    color: "#ff6400",
  },
  {
    icon: AlertTriangle,
    title: "XSS Risk Assessment",
    description: "Evaluates CSP strength and identifies XSS risk vectors.",
    color: "#ff3366",
  },
  {
    icon: Database,
    title: "Sensitive Path Probing",
    description: "Tests common sensitive paths like /.env, /.git/config for accessibility.",
    color: "#00d4ff",
  },
  {
    icon: BarChart3,
    title: "Security Score & Grade",
    description: "Weighted scoring across 5 security categories with A+ to F grading.",
    color: "#00ff88",
  },
  {
    icon: FileSearch,
    title: "PDF Report Generation",
    description: "Professional downloadable report with full findings and remediation steps.",
    color: "#7c3aed",
  },
  {
    icon: CheckCircle,
    title: "Best Practices Checklist",
    description: "10-point checklist of security best practices with pass/fail status.",
    color: "#ffaa00",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 px-4 relative">
      {/* Background */}
      <div className="absolute inset-0 hex-pattern opacity-30 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyber-surface/30 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/5 mb-4"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-mono text-xs text-cyan-400 tracking-wider uppercase">
              What We Check
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-orbitron text-3xl sm:text-4xl font-bold text-white mb-4"
          >
            COMPREHENSIVE SECURITY CHECKS
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-cyber-muted max-w-2xl mx-auto"
          >
            Every scan performs {FEATURES.length} real security checks against the live target.
            No simulated data — actual HTTP requests, actual findings.
          </motion.p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map(({ icon: Icon, title, description, color }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (i % 4) * 0.08 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="glass rounded-xl border border-cyber-border p-5 group cursor-default hover:border-cyan-500/20 transition-colors duration-300"
            >
              {/* Icon */}
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
                style={{
                  background: `${color}12`,
                  border: `1px solid ${color}25`,
                  boxShadow: `0 0 0 0 ${color}40`,
                }}
              >
                <Icon className="w-5 h-5" style={{ color }} />
              </div>

              <h3 className="text-sm font-semibold text-white mb-2 leading-snug group-hover:text-cyan-300 transition-colors">
                {title}
              </h3>
              <p className="text-xs text-cyber-muted leading-relaxed">{description}</p>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-cyber-muted text-sm mb-6">
            All checks are performed in real-time against your target. No API keys. No account required.
          </p>
          <a href="#scanner" className="btn-cyber btn-cyber-primary inline-flex">
            <Shield className="w-4 h-4" />
            Start Free Scan
          </a>
        </motion.div>
      </div>
    </section>
  );
}

