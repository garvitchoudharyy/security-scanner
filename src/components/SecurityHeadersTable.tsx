"use client";

/**
 * SECURITY HEADERS TABLE
 * =======================
 * Displays all analyzed HTTP security headers with
 * status indicators, values, and fix recommendations.
 */

import { motion } from "framer-motion";
import { CheckCircle, XCircle, Info } from "lucide-react";
import type { HeaderCheck } from "@/utils/scanner";
import { getSeverityColor } from "@/utils/helpers";

interface SecurityHeadersTableProps {
  headers: HeaderCheck[];
}

export default function SecurityHeadersTable({ headers }: SecurityHeadersTableProps) {
  const presentCount = headers.filter((h) => h.present).length;
  const totalCount = headers.length;

  return (
    <div className="space-y-3">
      {/* Summary bar */}
      <div className="flex items-center justify-between text-xs font-mono mb-4">
        <span className="text-cyber-muted">
          {presentCount}/{totalCount} headers configured
        </span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-cyber-muted">Present</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            <span className="text-cyber-muted">Missing</span>
          </div>
        </div>
      </div>

      {/* Header rows */}
      <div className="space-y-2">
        {headers.map((header, i) => {
          const sevColors = getSeverityColor(header.severity);
          return (
            <motion.div
              key={header.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              className={`group rounded-lg border overflow-hidden transition-all duration-200 ${
                header.present
                  ? "border-emerald-500/15 bg-emerald-500/5"
                  : "border-red-500/15 bg-red-500/5"
              }`}
            >
              <div className="flex items-start gap-3 px-4 py-3">
                {/* Status icon */}
                <div className="flex-shrink-0 mt-0.5">
                  {header.present ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400" />
                  )}
                </div>

                {/* Header info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <code className="text-xs font-mono text-white/90">
                      {header.name}
                    </code>
                    {/* Severity tag */}
                    {!header.present && (
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded border uppercase tracking-wider ${sevColors.badge}`}
                      >
                        {header.severity}
                      </span>
                    )}
                  </div>

                  {/* Value if present */}
                  {header.present && header.value && (
                    <code className="block text-xs text-cyber-muted mt-1 font-mono truncate">
                      {header.value.length > 80
                        ? header.value.slice(0, 80) + "..."
                        : header.value}
                    </code>
                  )}

                  {/* Recommendation if missing */}
                  {!header.present && (
                    <p className="text-xs text-cyber-muted mt-1 flex items-start gap-1">
                      <Info className="w-3 h-3 flex-shrink-0 mt-0.5 text-cyan-400/60" />
                      {header.recommendation}
                    </p>
                  )}
                </div>

                {/* Status text */}
                <div className="flex-shrink-0">
                  <span
                    className={`text-xs font-mono font-bold ${
                      header.present ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {header.present ? "PASS" : "FAIL"}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
