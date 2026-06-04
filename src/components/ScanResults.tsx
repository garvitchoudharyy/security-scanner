"use client";

/**
 * SCAN RESULTS DASHBOARD
 * ======================
 * The main results panel rendered after a successful scan.
 * Displays score, vulnerability list, charts, headers, cookies,
 * tech stack, and a PDF download button.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Download, RefreshCw, CheckCircle, XCircle,
  Globe, Clock, Server, Cookie, Code, FileText,
  AlertTriangle, Lock, Info, ChevronDown, ChevronUp,
  Wifi, Eye, Database, Zap
} from "lucide-react";
import type { ScanResult } from "@/utils/scanner";
import {
  getSeverityColor, getScoreColor, formatDate,
  formatDuration, extractDomain, truncate
} from "@/utils/helpers";
import ScoreGauge from "./ScoreGauge";
import VulnerabilityCard from "./VulnerabilityCard";
import SecurityHeadersTable from "./SecurityHeadersTable";
import { VulnerabilityPieChart, CategoryBarChart, CategoryRadarChart } from "./SecurityCharts";

interface ScanResultsProps {
  result: ScanResult;
  onRescan: () => void;
}

// ---- Tabbed section types ----
type Tab = "overview" | "vulnerabilities" | "headers" | "cookies" | "tech" | "details";

export default function ScanResults({ result, onRescan }: ScanResultsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [vulnFilter, setVulnFilter] = useState<string>("all");

  const { summary, vulnerabilities, securityHeaders, cookies, technologies, categoryScores } = result;

  // Severity order for sorting
  const severityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
  const sortedVulns = [...vulnerabilities].sort(
    (a, b) => severityOrder[a.severity] - severityOrder[b.severity]
  );

  const filteredVulns = vulnFilter === "all"
    ? sortedVulns
    : sortedVulns.filter(v => v.severity === vulnFilter);

  async function handleDownloadPDF() {
    setDownloadingPDF(true);
    try {
      const { generatePDFReport } = await import("@/utils/pdfGenerator");
      await generatePDFReport(result);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("PDF generation failed. Please try again.");
    } finally {
      setDownloadingPDF(false);
    }
  }

  const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "overview", label: "Overview", icon: Shield },
    { id: "vulnerabilities", label: `Vulns (${summary.totalVulnerabilities})`, icon: AlertTriangle },
    { id: "headers", label: "Headers", icon: Lock },
    { id: "cookies", label: `Cookies (${cookies.length})`, icon: Cookie },
    { id: "tech", label: "Tech Stack", icon: Code },
    { id: "details", label: "Details", icon: Info },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-6xl mx-auto space-y-6"
    >
      {/* ═══════════════════════════════════════════
          TOP BAR — Target info + action buttons
      ═══════════════════════════════════════════ */}
      <div className="glass rounded-xl border border-cyber-border p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
            <Globe className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="font-mono text-sm text-white font-medium">{extractDomain(result.url)}</div>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-xs text-cyber-muted font-mono">{formatDate(result.scannedAt)}</span>
              <span className="text-xs text-cyber-muted">·</span>
              <span className="text-xs text-cyber-muted font-mono">{formatDuration(result.scanDuration)}</span>
              <span className="text-xs text-cyber-muted">·</span>
              <span className={`text-xs font-mono font-bold ${result.isHttps ? "text-emerald-400" : "text-red-400"}`}>
                {result.isHttps ? "HTTPS" : "HTTP"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onRescan}
            className="btn-cyber text-xs py-2 px-4"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            New Scan
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={downloadingPDF}
            className="btn-cyber btn-cyber-primary text-xs py-2 px-4 disabled:opacity-60"
          >
            {downloadingPDF ? (
              <div className="w-3.5 h-3.5 border border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            {downloadingPDF ? "Generating…" : "Download PDF"}
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          SCORE HERO SECTION
      ═══════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score gauge */}
        <div className="glass rounded-xl border border-cyber-border p-6 flex flex-col items-center justify-center">
          <div className="text-xs font-mono text-cyber-muted uppercase tracking-widest mb-6">
            Security Score
          </div>
          <ScoreGauge
            score={result.overallScore}
            grade={result.grade}
            riskLevel={result.riskLevel}
            size={180}
          />
        </div>

        {/* Summary stat cards */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3">
          {[
            { label: "Critical", count: summary.critical, color: "#ff3366", bg: "rgba(255,51,102,0.08)", border: "rgba(255,51,102,0.2)" },
            { label: "High", count: summary.high, color: "#ff6400", bg: "rgba(255,100,0,0.08)", border: "rgba(255,100,0,0.2)" },
            { label: "Medium", count: summary.medium, color: "#ffaa00", bg: "rgba(255,170,0,0.08)", border: "rgba(255,170,0,0.2)" },
            { label: "Low", count: summary.low, color: "#00d4ff", bg: "rgba(0,212,255,0.08)", border: "rgba(0,212,255,0.2)" },
          ].map(({ label, count, color, bg, border }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 + 0.3 }}
              className="rounded-xl border p-4 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all hover:scale-105"
              style={{ background: bg, borderColor: border }}
              onClick={() => { setVulnFilter(label.toLowerCase()); setActiveTab("vulnerabilities"); }}
            >
              <div className="font-orbitron text-3xl font-black" style={{ color, textShadow: `0 0 15px ${color}60` }}>
                {count}
              </div>
              <div className="text-xs font-mono uppercase tracking-wider" style={{ color }}>
                {label}
              </div>
            </motion.div>
          ))}

          {/* Passed checks */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex flex-col items-center justify-center gap-1 sm:col-span-2 xl:col-span-2"
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span className="font-orbitron text-2xl font-black text-emerald-400">
                {summary.passedChecks}/{summary.totalChecks}
              </span>
            </div>
            <div className="text-xs font-mono text-emerald-400/70 uppercase tracking-wider">
              Checks Passed
            </div>
            {/* Mini progress bar */}
            <div className="w-full h-1 bg-cyber-card rounded-full mt-1 overflow-hidden">
              <motion.div
                className="h-full bg-emerald-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(summary.passedChecks / summary.totalChecks) * 100}%` }}
                transition={{ duration: 1, delay: 0.8 }}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          QUICK STATUS ROW
      ═══════════════════════════════════════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "HTTPS", value: result.isHttps, icon: Lock },
          { label: "HSTS", value: result.hasHSTS, icon: Shield },
          { label: "CSP", value: result.hasCSP, icon: Eye },
          { label: "Anti-Clickjack", value: result.clickjackingProtection, icon: Zap },
          { label: "X-Content-Type", value: result.hasXContentTypeOptions, icon: FileText },
          { label: "HTTPS Redirect", value: result.httpRedirectsToHttps, icon: Wifi },
        ].map(({ label, value, icon: Icon }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-lg border p-3 flex flex-col items-center gap-1.5 text-center transition-colors ${
              value
                ? "border-emerald-500/20 bg-emerald-500/5"
                : "border-red-500/20 bg-red-500/5"
            }`}
          >
            <Icon className={`w-4 h-4 ${value ? "text-emerald-400" : "text-red-400"}`} />
            <div className={`text-[10px] font-mono uppercase tracking-wider ${value ? "text-emerald-400" : "text-red-400"}`}>
              {label}
            </div>
            <div className={`text-[10px] font-bold font-mono ${value ? "text-emerald-400" : "text-red-400"}`}>
              {value ? "PASS" : "FAIL"}
            </div>
          </motion.div>
        ))}
      </div>

      {/* ═══════════════════════════════════════════
          TABBED CONTENT
      ═══════════════════════════════════════════ */}
      <div className="glass rounded-xl border border-cyber-border overflow-hidden">
        {/* Tab bar */}
        <div className="flex overflow-x-auto border-b border-cyber-border scrollbar-none">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-4 py-3.5 text-xs font-mono uppercase tracking-wider whitespace-nowrap transition-all flex-shrink-0 border-b-2 ${
                activeTab === id
                  ? "border-cyan-400 text-cyan-400 bg-cyan-500/5"
                  : "border-transparent text-cyber-muted hover:text-white hover:bg-white/3"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-6">
          <AnimatePresence mode="wait">

            {/* ─────────────────────────────────
                OVERVIEW TAB
            ───────────────────────────────── */}
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                {/* Charts row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="text-xs font-mono text-cyber-muted uppercase tracking-widest mb-4">
                      Vulnerability Distribution
                    </h3>
                    <VulnerabilityPieChart summary={summary} />
                  </div>
                  <div>
                    <h3 className="text-xs font-mono text-cyber-muted uppercase tracking-widest mb-4">
                      Category Scores
                    </h3>
                    <CategoryBarChart categoryScores={categoryScores} />
                  </div>
                  <div>
                    <h3 className="text-xs font-mono text-cyber-muted uppercase tracking-widest mb-4">
                      Security Radar
                    </h3>
                    <CategoryRadarChart categoryScores={categoryScores} />
                  </div>
                </div>

                <div className="section-divider" />

                {/* Category scores with progress bars */}
                <div>
                  <h3 className="text-xs font-mono text-cyber-muted uppercase tracking-widest mb-5">
                    Category Breakdown
                  </h3>
                  <div className="space-y-4">
                    {[
                      { label: "Security Headers", score: categoryScores.headers, max: 30, desc: `${securityHeaders.filter(h => h.present).length}/${securityHeaders.length} headers present` },
                      { label: "SSL/TLS Security", score: categoryScores.ssl, max: 20, desc: result.isHttps ? "HTTPS enabled" : "No HTTPS" },
                      { label: "Cookie Security", score: categoryScores.cookies, max: 20, desc: `${cookies.length} cookie(s) analyzed` },
                      { label: "Content Security", score: categoryScores.content, max: 20, desc: result.hasCSP ? "CSP configured" : "No CSP" },
                      { label: "Information Disclosure", score: categoryScores.information, max: 10, desc: result.serverInfoExposed ? "Server info exposed" : "Minimal info exposed" },
                    ].map(({ label, score, desc }, i) => {
                      const color = getScoreColor(score);
                      return (
                        <div key={label}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm text-white/90">{label}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-cyber-muted font-mono">{desc}</span>
                              <span className="text-sm font-mono font-bold" style={{ color }}>{score}%</span>
                            </div>
                          </div>
                          <div className="h-1.5 bg-cyber-card rounded-full overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
                              style={{ background: color, boxShadow: `0 0 8px ${color}60` }}
                              initial={{ width: 0 }}
                              animate={{ width: `${score}%` }}
                              transition={{ duration: 0.8, delay: i * 0.1 + 0.2 }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="section-divider" />

                {/* Executive summary */}
                <div>
                  <h3 className="text-xs font-mono text-cyber-muted uppercase tracking-widest mb-4">
                    Executive Summary
                  </h3>
                  <div className="bg-cyber-bg/50 rounded-lg border border-cyber-border p-5 space-y-3">
                    {[
                      result.overallScore >= 80
                        ? `✅ ${extractDomain(result.url)} demonstrates a strong security posture with a score of ${result.overallScore}/100 (Grade: ${result.grade}).`
                        : result.overallScore >= 60
                        ? `⚠️ ${extractDomain(result.url)} has a moderate security posture (${result.overallScore}/100, Grade: ${result.grade}) with several improvements needed.`
                        : `🚨 ${extractDomain(result.url)} has significant security gaps (${result.overallScore}/100, Grade: ${result.grade}) requiring immediate attention.`,

                      `A total of ${summary.totalVulnerabilities} security issue(s) were detected: ${summary.critical} critical, ${summary.high} high, ${summary.medium} medium, ${summary.low} low, and ${summary.info} informational.`,

                      result.isHttps
                        ? `The site correctly uses HTTPS${result.hasHSTS ? " and enforces it via HSTS" : ", but HSTS is not configured"}.`
                        : `⚠️ The site does NOT use HTTPS — all data is transmitted in plaintext, posing a critical risk.`,

                      result.hasCSP
                        ? `A Content Security Policy is in place${result.cspValue?.includes("unsafe-inline") ? ", though it contains 'unsafe-inline' which weakens XSS protection" : ", providing protection against XSS attacks"}.`
                        : `No Content Security Policy (CSP) is configured, leaving the site vulnerable to Cross-Site Scripting (XSS) attacks.`,

                      `${securityHeaders.filter(h => h.present).length} of ${securityHeaders.length} recommended security headers are present. ${securityHeaders.filter(h => !h.present).length > 0 ? `Missing: ${securityHeaders.filter(h => !h.present).map(h => h.name).join(", ")}.` : ""}`,

                      technologies.length > 0
                        ? `Detected technologies: ${technologies.map(t => t.name + (t.version ? ` ${t.version}` : "")).join(", ")}.`
                        : "No specific technology stack was detected.",
                    ].map((line, i) => (
                      <p key={i} className="text-sm text-cyber-text leading-relaxed">{line}</p>
                    ))}
                  </div>
                </div>

                {/* Robots & Sitemap */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-lg border border-cyber-border bg-cyber-card/30 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-mono text-cyber-muted uppercase tracking-wider">robots.txt</span>
                      <span className={`ml-auto text-xs font-mono font-bold ${result.robotsTxt.found ? "text-emerald-400" : "text-red-400"}`}>
                        {result.robotsTxt.found ? "FOUND" : "NOT FOUND"}
                      </span>
                    </div>
                    {result.robotsTxt.found && (
                      <div className="text-xs text-cyber-muted">
                        {result.robotsTxt.exposesSensitivePaths
                          ? <span className="text-yellow-400">⚠ Exposes {result.robotsTxt.sensitivePaths.length} sensitive path(s)</span>
                          : <span className="text-emerald-400">✓ No sensitive paths exposed</span>
                        }
                      </div>
                    )}
                    {result.robotsTxt.exposesSensitivePaths && result.robotsTxt.sensitivePaths.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {result.robotsTxt.sensitivePaths.slice(0, 4).map(p => (
                          <code key={p} className="block text-[10px] font-mono text-yellow-400/70">{p}</code>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="rounded-lg border border-cyber-border bg-cyber-card/30 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-mono text-cyber-muted uppercase tracking-wider">sitemap.xml</span>
                      <span className={`ml-auto text-xs font-mono font-bold ${result.sitemap.found ? "text-emerald-400" : "text-yellow-400"}`}>
                        {result.sitemap.found ? "FOUND" : "NOT FOUND"}
                      </span>
                    </div>
                    <div className="text-xs text-cyber-muted">
                      {result.sitemap.found
                        ? <span className="text-emerald-400">✓ Sitemap is available for crawlers</span>
                        : <span className="text-yellow-400">Consider adding a sitemap for better SEO</span>
                      }
                    </div>
                    {result.sitemap.url && (
                      <a
                        href={result.sitemap.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-mono text-cyan-400/70 hover:text-cyan-400 transition-colors mt-1 block truncate"
                      >
                        {result.sitemap.url}
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ─────────────────────────────────
                VULNERABILITIES TAB
            ───────────────────────────────── */}
            {activeTab === "vulnerabilities" && (
              <motion.div
                key="vulnerabilities"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Filter bar */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono text-cyber-muted">Filter:</span>
                  {["all", "critical", "high", "medium", "low", "info"].map((f) => {
                    const count = f === "all"
                      ? summary.totalVulnerabilities
                      : vulnerabilities.filter(v => v.severity === f).length;
                    const colors = f === "all"
                      ? { text: "text-white", border: "border-cyber-border", bg: vulnFilter === f ? "bg-white/10" : "" }
                      : getSeverityColor(f as "critical" | "high" | "medium" | "low" | "info");
                    return (
                      <button
                        key={f}
                        onClick={() => setVulnFilter(f)}
                        className={`px-3 py-1 rounded border text-xs font-mono uppercase tracking-wider transition-all ${
                          vulnFilter === f
                            ? `${f === "all" ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-400" : `${colors.border} ${colors.bg} ${colors.text}`}`
                            : "border-cyber-border text-cyber-muted hover:text-white"
                        }`}
                      >
                        {f} {count > 0 ? `(${count})` : ""}
                      </button>
                    );
                  })}
                </div>

                {filteredVulns.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <CheckCircle className="w-12 h-12 text-emerald-400 mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">
                      No {vulnFilter === "all" ? "" : vulnFilter} vulnerabilities found!
                    </h3>
                    <p className="text-sm text-cyber-muted">
                      {vulnFilter === "all"
                        ? "Excellent! This site passed all security checks."
                        : `No ${vulnFilter}-severity issues were detected.`
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredVulns.map((vuln, i) => (
                      <VulnerabilityCard key={vuln.id} vuln={vuln} index={i} />
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ─────────────────────────────────
                HEADERS TAB
            ───────────────────────────────── */}
            {activeTab === "headers" && (
              <motion.div
                key="headers"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <SecurityHeadersTable headers={securityHeaders} />

                {/* CSP detail */}
                {result.hasCSP && result.cspValue && (
                  <div className="mt-6">
                    <h3 className="text-xs font-mono text-cyber-muted uppercase tracking-widest mb-3">
                      Content-Security-Policy Value
                    </h3>
                    <div className="bg-cyber-bg/60 border border-cyber-border rounded-lg p-4">
                      <code className="text-xs font-mono text-cyan-300 break-all leading-relaxed">
                        {result.cspValue}
                      </code>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {result.cspValue.includes("unsafe-inline") && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-yellow-500/30 bg-yellow-500/10 text-yellow-400">
                            ⚠ unsafe-inline
                          </span>
                        )}
                        {result.cspValue.includes("unsafe-eval") && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-yellow-500/30 bg-yellow-500/10 text-yellow-400">
                            ⚠ unsafe-eval
                          </span>
                        )}
                        {result.cspValue.includes("*") && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-orange-500/30 bg-orange-500/10 text-orange-400">
                            ⚠ wildcard (*)
                          </span>
                        )}
                        {!result.cspValue.includes("unsafe-inline") && !result.cspValue.includes("unsafe-eval") && !result.cspValue.includes("*") && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                            ✓ No obvious weaknesses detected
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* HSTS detail */}
                {result.hasHSTS && result.hstsValue && (
                  <div className="mt-4">
                    <h3 className="text-xs font-mono text-cyber-muted uppercase tracking-widest mb-3">
                      Strict-Transport-Security Value
                    </h3>
                    <div className="bg-cyber-bg/60 border border-emerald-500/20 rounded-lg p-4">
                      <code className="text-xs font-mono text-emerald-300">{result.hstsValue}</code>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {result.hstsValue.includes("includeSubDomains") && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">✓ includeSubDomains</span>
                        )}
                        {result.hstsValue.includes("preload") && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">✓ preload</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ─────────────────────────────────
                COOKIES TAB
            ───────────────────────────────── */}
            {activeTab === "cookies" && (
              <motion.div
                key="cookies"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {cookies.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Cookie className="w-12 h-12 text-cyber-muted mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">No Cookies Detected</h3>
                    <p className="text-sm text-cyber-muted">
                      No Set-Cookie headers were found in the response.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="text-xs font-mono text-cyber-muted mb-4">
                      {cookies.length} cookie(s) analyzed for security flags
                    </div>
                    {cookies.map((cookie, i) => {
                      const allSecure = cookie.hasSecure && cookie.hasHttpOnly && cookie.hasSameSite;
                      const hasIssues = !cookie.hasSecure || !cookie.hasHttpOnly || !cookie.hasSameSite;
                      return (
                        <motion.div
                          key={`${cookie.name}-${i}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className={`rounded-lg border p-4 ${
                            allSecure
                              ? "border-emerald-500/20 bg-emerald-500/5"
                              : "border-yellow-500/20 bg-yellow-500/5"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Cookie className="w-4 h-4 text-cyber-muted" />
                              <code className="text-sm font-mono text-white font-medium">{cookie.name}</code>
                            </div>
                            <span className={`text-xs font-mono font-bold ${allSecure ? "text-emerald-400" : "text-yellow-400"}`}>
                              {allSecure ? "SECURE" : "ISSUES FOUND"}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            {[
                              { label: "Secure", ok: cookie.hasSecure, desc: "Sent over HTTPS only" },
                              { label: "HttpOnly", ok: cookie.hasHttpOnly, desc: "Not accessible via JS" },
                              { label: "SameSite", ok: cookie.hasSameSite, desc: cookie.sameSiteValue ? `Value: ${cookie.sameSiteValue}` : "CSRF protection" },
                            ].map(({ label, ok, desc }) => (
                              <div
                                key={label}
                                className={`rounded border p-2 text-center ${
                                  ok ? "border-emerald-500/20 bg-emerald-500/5" : "border-red-500/20 bg-red-500/5"
                                }`}
                              >
                                <div className={`text-xs font-mono font-bold ${ok ? "text-emerald-400" : "text-red-400"}`}>
                                  {ok ? "✓" : "✗"} {label}
                                </div>
                                <div className="text-[10px] text-cyber-muted mt-0.5">{desc}</div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      );
                    })}
                  </>
                )}
              </motion.div>
            )}

            {/* ─────────────────────────────────
                TECH STACK TAB
            ───────────────────────────────── */}
            {activeTab === "tech" && (
              <motion.div
                key="tech"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {technologies.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Code className="w-12 h-12 text-cyber-muted mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">No Technologies Detected</h3>
                    <p className="text-sm text-cyber-muted">
                      Could not identify specific technologies from headers or page source.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="text-xs font-mono text-cyber-muted">
                      {technologies.length} technology/technologies identified
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {technologies.map((tech, i) => (
                        <motion.div
                          key={tech.name}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.06 }}
                          className="rounded-lg border border-cyber-border bg-cyber-card/30 p-4 card-hover"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="text-sm font-semibold text-white">
                                {tech.name}
                                {tech.version && (
                                  <span className="text-xs text-cyber-muted ml-1">v{tech.version}</span>
                                )}
                              </div>
                              <div className="text-xs text-cyan-400/70 font-mono mt-0.5">{tech.category}</div>
                            </div>
                            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                              tech.confidence === "high"
                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                                : tech.confidence === "medium"
                                ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-400"
                                : "border-cyber-border text-cyber-muted"
                            }`}>
                              {tech.confidence}
                            </span>
                          </div>

                          {/* Security note */}
                          {(tech.name === "WordPress" || tech.name === "Joomla" || tech.name === "Drupal") && (
                            <div className="mt-2 text-[10px] text-yellow-400/80 font-mono flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Keep CMS and plugins updated
                            </div>
                          )}
                          {tech.name === "PHP" && (
                            <div className="mt-2 text-[10px] text-yellow-400/80 font-mono flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Ensure PHP is up to date
                            </div>
                          )}
                          {(tech.name === "Nginx" || tech.name === "Apache") && (
                            <div className="mt-2 text-[10px] text-cyan-400/70 font-mono flex items-center gap-1">
                              <Info className="w-3 h-3" />
                              Hide version in server config
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {/* ─────────────────────────────────
                DETAILS TAB
            ───────────────────────────────── */}
            {activeTab === "details" && (
              <motion.div
                key="details"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* HTTP Details */}
                <div>
                  <h3 className="text-xs font-mono text-cyber-muted uppercase tracking-widest mb-4">
                    HTTP Response Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { label: "Final URL", value: result.finalUrl, mono: true },
                      { label: "HTTP Status Code", value: result.statusCode.toString(), mono: true },
                      { label: "Protocol", value: result.isHttps ? "HTTPS (Secure)" : "HTTP (Insecure)", mono: false },
                      { label: "Response Time", value: formatDuration(result.responseTime), mono: true },
                      { label: "Server", value: result.serverHeader || "Not disclosed", mono: true },
                      { label: "X-Powered-By", value: result.poweredByHeader || "Not disclosed", mono: true },
                    ].map(({ label, value, mono }) => (
                      <div key={label} className="rounded-lg border border-cyber-border bg-cyber-card/20 p-3">
                        <div className="text-xs text-cyber-muted font-mono mb-1 uppercase tracking-wider">{label}</div>
                        <div className={`text-sm text-white ${mono ? "font-mono" : ""} break-all`}>{value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Email exposure */}
                {result.emailsFound.length > 0 && (
                  <div>
                    <h3 className="text-xs font-mono text-cyber-muted uppercase tracking-widest mb-3">
                      Email Addresses Exposed in Source
                    </h3>
                    <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4 space-y-2">
                      {result.emailsFound.map(email => (
                        <code key={email} className="block text-xs font-mono text-yellow-400">{email}</code>
                      ))}
                      <p className="text-xs text-cyber-muted mt-2">
                        These emails are visible in the page source and could be harvested for spam or phishing.
                      </p>
                    </div>
                  </div>
                )}

                {/* Sensitive paths */}
                {result.sensitivePaths.length > 0 && (
                  <div>
                    <h3 className="text-xs font-mono text-cyber-muted uppercase tracking-widest mb-3">
                      Sensitive Path Probing Results
                    </h3>
                    <div className="space-y-2">
                      {result.sensitivePaths.map(({ path, accessible, statusCode }) => (
                        <div
                          key={path}
                          className={`flex items-center justify-between rounded-lg border p-3 ${
                            accessible
                              ? "border-red-500/30 bg-red-500/5"
                              : "border-cyber-border bg-cyber-card/20"
                          }`}
                        >
                          <code className="text-xs font-mono text-white">{path}</code>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-cyber-muted">{statusCode}</span>
                            <span className={`text-xs font-mono font-bold ${accessible ? "text-red-400" : "text-emerald-400"}`}>
                              {accessible ? "ACCESSIBLE ⚠" : "PROTECTED ✓"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Robots.txt content */}
                {result.robotsTxt.found && result.robotsTxt.content && (
                  <div>
                    <h3 className="text-xs font-mono text-cyber-muted uppercase tracking-widest mb-3">
                      robots.txt Content
                    </h3>
                    <div className="bg-cyber-bg/60 border border-cyber-border rounded-lg p-4 max-h-48 overflow-y-auto">
                      <pre className="text-xs font-mono text-cyan-300/80 whitespace-pre-wrap">
                        {result.robotsTxt.content}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Security best practices checklist */}
                <div>
                  <h3 className="text-xs font-mono text-cyber-muted uppercase tracking-widest mb-4">
                    Security Best Practices Checklist
                  </h3>
                  <div className="space-y-2">
                    {[
                      { label: "Use HTTPS everywhere", pass: result.isHttps },
                      { label: "Enable HSTS with long max-age", pass: result.hasHSTS },
                      { label: "Implement Content Security Policy", pass: result.hasCSP },
                      { label: "Set X-Frame-Options to prevent clickjacking", pass: result.hasXFrameOptions },
                      { label: "Add X-Content-Type-Options: nosniff", pass: result.hasXContentTypeOptions },
                      { label: "Configure Referrer-Policy", pass: result.hasReferrerPolicy },
                      { label: "Protect all cookies (Secure + HttpOnly + SameSite)", pass: cookies.length === 0 || cookies.every(c => c.hasSecure && c.hasHttpOnly && c.hasSameSite) },
                      { label: "Hide server version information", pass: !result.serverInfoExposed },
                      { label: "Remove X-Powered-By header", pass: !result.poweredByHeader },
                      { label: "Redirect HTTP to HTTPS", pass: result.httpRedirectsToHttps },
                    ].map(({ label, pass }) => (
                      <div
                        key={label}
                        className={`flex items-center gap-3 p-3 rounded-lg border ${
                          pass ? "border-emerald-500/15 bg-emerald-500/5" : "border-red-500/15 bg-red-500/5"
                        }`}
                      >
                        {pass
                          ? <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          : <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                        }
                        <span className={`text-sm ${pass ? "text-emerald-300/80" : "text-red-300/80"}`}>
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

