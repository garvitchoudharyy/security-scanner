"use client";

/**
 * SCORE GAUGE COMPONENT
 * =====================
 * Animated circular gauge showing the security score.
 * Uses SVG arcs for the ring and Framer Motion for animation.
 */

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getScoreColor, getRiskLevelColor, gradeInfo } from "@/utils/helpers";

interface ScoreGaugeProps {
  score: number;
  grade: string;
  riskLevel: string;
  size?: number;
}

export default function ScoreGauge({
  score,
  grade,
  riskLevel,
  size = 180,
}: ScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  // Animate the score counting up
  useEffect(() => {
    let start = 0;
    const duration = 1500;
    const startTime = performance.now();

    function update(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Easing function
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.round(eased * score);
      setAnimatedScore(start);
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }, [score]);

  // SVG circle math
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  const color = getScoreColor(score);
  const riskColors = getRiskLevelColor(riskLevel);
  const gradeData = gradeInfo(grade);

  // Create gradient colors for the arc
  const startColor = "#00d4ff";
  const endColor = color;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* SVG Gauge */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
          viewBox={`0 0 ${size} ${size}`}
        >
          {/* Define gradient */}
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={startColor} />
              <stop offset="100%" stopColor={endColor} />
            </linearGradient>
            {/* Glow filter */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(0,212,255,0.08)"
            strokeWidth={12}
          />

          {/* Tick marks */}
          {Array.from({ length: 10 }).map((_, i) => {
            const angle = (i * 36 * Math.PI) / 180;
            const x1 = size / 2 + (radius - 18) * Math.cos(angle);
            const y1 = size / 2 + (radius - 18) * Math.sin(angle);
            const x2 = size / 2 + (radius - 8) * Math.cos(angle);
            const y2 = size / 2 + (radius - 8) * Math.sin(angle);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="rgba(0,212,255,0.15)"
                strokeWidth={1}
              />
            );
          })}

          {/* Score arc */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#scoreGradient)"
            strokeWidth={12}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            filter="url(#glow)"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-center"
          >
            <div
              className="font-orbitron font-black leading-none"
              style={{
                fontSize: size * 0.22,
                color: color,
                textShadow: `0 0 20px ${color}80`,
              }}
            >
              {animatedScore}
            </div>
            <div
              className="font-mono text-xs mt-1"
              style={{ color: "rgba(74,96,128,0.8)" }}
            >
              / 100
            </div>
          </motion.div>
        </div>
      </div>

      {/* Grade and risk level */}
      <div className="flex items-center gap-4">
        {/* Grade badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col items-center gap-1"
        >
          <div
            className="font-orbitron text-3xl font-black"
            style={{
              color: color,
              textShadow: `0 0 15px ${color}60`,
            }}
          >
            {grade}
          </div>
          <div className="text-xs text-cyber-muted font-mono uppercase tracking-wider">
            Grade
          </div>
        </motion.div>

        {/* Divider */}
        <div className="w-px h-12 bg-cyber-border" />

        {/* Risk level */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="flex flex-col items-center gap-1"
        >
          <div
            className={`px-3 py-1 rounded border font-mono text-sm font-bold uppercase ${riskColors.text} ${riskColors.bg}`}
            style={{
              borderColor: "rgba(0,212,255,0.2)",
            }}
          >
            {riskLevel}
          </div>
          <div className="text-xs text-cyber-muted font-mono uppercase tracking-wider">
            Risk Level
          </div>
        </motion.div>
      </div>

      {/* Grade description */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="text-xs text-cyber-muted text-center font-mono max-w-32"
      >
        {gradeData.description}
      </motion.p>
    </div>
  );
}

