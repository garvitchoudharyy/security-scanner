"use client";

/**
 * HOW IT WORKS SECTION
 * ====================
 * Explains the scanning process with animated step cards.
 */

import { motion } from "framer-motion";
import { Globe, Search, FileBarChart, Download } from "lucide-react";

const STEPS = [
  {
    number: "01",
    icon: Globe,
    title: "Enter Target URL",
    description:
      "Paste any website URL into the scanner. We support both HTTP and HTTPS sites across all domains.",
    color: "#00d4ff",
  },
  {
    number: "02",
    icon: Search,
    title: "Real-Time Analysis",
    description:
      "Our engine sends live HTTP requests to the target, analyzing headers, SSL, cookies, content, and server responses.",
    color: "#00ff88",
  },
  {
    number: "03",
    icon: FileBarChart,
    title: "Vulnerability Detection",
    description:
      "Each response is evaluated against OWASP standards. Issues are classified by severity with detailed explanations.",
    color: "#ffaa00",
  },
  {
    number: "04",
    icon: Download,
    title: "Download PDF Report",
    description:
      "Get a professional security report with your score, all findings, and step-by-step remediation guidance.",
    color: "#7c3aed",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-4 relative">
      {/* Background accent */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(0,212,255,0.03),transparent)] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative">
        {/* Section header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/5 mb-4"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span className="font-mono text-xs text-cyan-400 tracking-wider uppercase">
              Process
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-orbitron text-3xl sm:text-4xl font-bold text-white mb-4"
          >
            HOW IT WORKS
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-cyber-muted max-w-xl mx-auto"
          >
            From URL input to full security report in under 15 seconds.
            No signup, no API keys, no limits.
          </motion.p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Connector line (desktop) */}
          <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />

          {STEPS.map(({ number, icon: Icon, title, description, color }, i) => (
            <motion.div
              key={number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="relative flex flex-col items-center text-center group"
            >
              {/* Step number + icon circle */}
              <div className="relative mb-6">
                {/* Glow ring */}
                <div
                  className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-150"
                  style={{ background: `radial-gradient(circle, ${color}20, transparent 70%)` }}
                />
                {/* Icon circle */}
                <div
                  className="w-20 h-20 rounded-full border-2 flex items-center justify-center relative transition-all duration-300 group-hover:scale-110"
                  style={{
                    background: `${color}10`,
                    borderColor: `${color}30`,
                    boxShadow: `0 0 20px ${color}20`,
                  }}
                >
                  <Icon className="w-8 h-8" style={{ color }} />

                  {/* Step number badge */}
                  <div
                    className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-bold"
                    style={{ background: color, color: "#020409" }}
                  >
                    {i + 1}
                  </div>
                </div>
              </div>

              <h3 className="font-orbitron text-sm font-bold text-white mb-2 uppercase tracking-wide">
                {title}
              </h3>
              <p className="text-xs text-cyber-muted leading-relaxed">{description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

