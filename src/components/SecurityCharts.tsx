"use client";

/**
 * SECURITY CHARTS COMPONENTS
 * ===========================
 * Recharts-based visualizations for the security dashboard.
 * Includes:
 * - VulnerabilityPieChart: Donut chart showing severity distribution
 * - CategoryRadarChart: Radar chart for category scores
 * - CategoryBarChart: Bar chart for category scores
 */

import {
  PieChart, Pie, Cell, Tooltip, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
} from "recharts";
import type { ScanResult } from "@/utils/scanner";

// Custom tooltip for pie chart
const CustomPieTooltip = ({ active, payload }: { active?: boolean; payload?: { name: string; value: number; payload: { color: string } }[] }) => {
  if (active && payload && payload.length) {
    const entry = payload[0];
    return (
      <div className="glass px-3 py-2 rounded border border-cyber-border text-xs font-mono">
        <span style={{ color: entry.payload.color }}>{entry.name}</span>
        <span className="text-white ml-2">{entry.value} issues</span>
      </div>
    );
  }
  return null;
};

// Custom tooltip for bar chart
const CustomBarTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass px-3 py-2 rounded border border-cyber-border text-xs font-mono">
        <div className="text-cyan-400">{label}</div>
        <div className="text-white">{payload[0].value}% score</div>
      </div>
    );
  }
  return null;
};

// ============================================================
// VULNERABILITY PIE CHART
// ============================================================
interface PieChartProps {
  summary: ScanResult["summary"];
}

export function VulnerabilityPieChart({ summary }: PieChartProps) {
  const data = [
    { name: "Critical", value: summary.critical, color: "#ff3366" },
    { name: "High", value: summary.high, color: "#ff6400" },
    { name: "Medium", value: summary.medium, color: "#ffaa00" },
    { name: "Low", value: summary.low, color: "#00d4ff" },
    { name: "Info", value: summary.info, color: "#7c3aed" },
  ].filter((d) => d.value > 0);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-cyber-muted text-sm font-mono">
        No vulnerabilities found 🎉
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={80}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.color}
              stroke={entry.color}
              strokeWidth={0}
              style={{ filter: `drop-shadow(0 0 6px ${entry.color}60)` }}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomPieTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span style={{ color: "#4a6080", fontSize: "11px", fontFamily: "JetBrains Mono, monospace" }}>
              {value}
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ============================================================
// CATEGORY BAR CHART
// ============================================================
interface BarChartProps {
  categoryScores: ScanResult["categoryScores"];
}

export function CategoryBarChart({ categoryScores }: BarChartProps) {
  const data = [
    { name: "Headers", score: categoryScores.headers },
    { name: "SSL/TLS", score: categoryScores.ssl },
    { name: "Cookies", score: categoryScores.cookies },
    { name: "Content", score: categoryScores.content },
    { name: "Info Disc.", score: categoryScores.information },
  ];

  // Custom bar color based on score
  const getBarColor = (score: number) => {
    if (score >= 80) return "#00ff88";
    if (score >= 60) return "#00d4ff";
    if (score >= 40) return "#ffaa00";
    if (score >= 20) return "#ff6400";
    return "#ff3366";
  };

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(0,212,255,0.05)"
          vertical={false}
        />
        <XAxis
          dataKey="name"
          tick={{ fill: "#4a6080", fontSize: 10, fontFamily: "JetBrains Mono" }}
          axisLine={{ stroke: "rgba(0,212,255,0.1)" }}
          tickLine={false}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fill: "#4a6080", fontSize: 10, fontFamily: "JetBrains Mono" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "rgba(0,212,255,0.05)" }} />
        <Bar dataKey="score" radius={[4, 4, 0, 0]} maxBarSize={40}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={getBarColor(entry.score)}
              style={{ filter: `drop-shadow(0 0 4px ${getBarColor(entry.score)}60)` }}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ============================================================
// CATEGORY RADAR CHART
// ============================================================
export function CategoryRadarChart({ categoryScores }: BarChartProps) {
  const data = [
    { subject: "Headers", score: categoryScores.headers, fullMark: 100 },
    { subject: "SSL/TLS", score: categoryScores.ssl, fullMark: 100 },
    { subject: "Cookies", score: categoryScores.cookies, fullMark: 100 },
    { subject: "Content", score: categoryScores.content, fullMark: 100 },
    { subject: "Info Sec.", score: categoryScores.information, fullMark: 100 },
  ];

  return (
    <ResponsiveContainer width="100%" height={220}>
      <RadarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
        <PolarGrid stroke="rgba(0,212,255,0.1)" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fill: "#4a6080", fontSize: 9, fontFamily: "JetBrains Mono" }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={{ fill: "#4a6080", fontSize: 8 }}
          axisLine={false}
        />
        <Radar
          name="Security Score"
          dataKey="score"
          stroke="#00d4ff"
          fill="#00d4ff"
          fillOpacity={0.1}
          strokeWidth={1.5}
        />
        <Tooltip
          contentStyle={{
            background: "rgba(6,13,26,0.95)",
            border: "1px solid rgba(0,212,255,0.2)",
            borderRadius: "8px",
            fontFamily: "JetBrains Mono",
            fontSize: "11px",
          }}
          labelStyle={{ color: "#00d4ff" }}
          itemStyle={{ color: "#c8d8f0" }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

