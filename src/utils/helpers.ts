**
 * UTILITY HELPERS
 * ===============
 * Shared utility functions for the security scanner frontend.
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Severity } from "./scanner";

/**
 * Merges Tailwind CSS classes with conflict resolution.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Returns color classes for a given severity level.
 */
export function getSeverityColor(severity: Severity): {
  text: string;
  bg: string;
  border: string;
  badge: string;
  dot: string;
} {
  switch (severity) {
    case "critical":
      return {
        text: "text-red-400",
        bg: "bg-red-500/10",
        border: "border-red-500/30",
        badge: "bg-red-500/20 text-red-400 border-red-500/40",
        dot: "bg-red-400",
      };
    case "high":
      return {
        text: "text-orange-400",
        bg: "bg-orange-500/10",
        border: "border-orange-500/30",
        badge: "bg-orange-500/20 text-orange-400 border-orange-500/40",
        dot: "bg-orange-400",
      };
    case "medium":
      return {
        text: "text-yellow-400",
        bg: "bg-yellow-500/10",
        border: "border-yellow-500/30",
        badge: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
        dot: "bg-yellow-400",
      };
    case "low":
      return {
        text: "text-cyan-400",
        bg: "bg-cyan-500/10",
        border: "border-cyan-500/30",
        badge: "bg-cyan-500/20 text-cyan-400 border-cyan-500/40",
        dot: "bg-cyan-400",
      };
    case "info":
    default:
      return {
        text: "text-purple-400",
        bg: "bg-purple-500/10",
        border: "border-purple-500/30",
        badge: "bg-purple-500/20 text-purple-400 border-purple-500/40",
        dot: "bg-purple-400",
      };
  }
}

/**
 * Returns the color for a security score value (0-100).
*/
export function getScoreColor(score: number): string {
  if (score >= 80) return "#00ff88";
  if (score >= 60) return "#00d4ff";
  if (score >= 40) return "#ffaa00";
  if (score >= 20) return "#ff6400";
  return "#ff3366";
}

/**
 * Returns a human-readable label for a risk level.
 */
export function getRiskLevelColor(
  risk: string
): { text: string; bg: string; glow: string } {
  switch (risk.toLowerCase()) {
    case "excellent":
      return { text: "text-emerald-400", bg: "bg-emerald-500/20", glow: "shadow-emerald-500/30" };
    case "low":
      return { text: "text-green-400", bg: "bg-green-500/20", glow: "shadow-green-500/30" };
    case "medium":
      return { text: "text-yellow-400", bg: "bg-yellow-500/20", glow: "shadow-yellow-500/30" };
    case "high":
      return { text: "text-orange-400", bg: "bg-orange-500/20", glow: "shadow-orange-500/30" };
    case "critical":
      return { text: "text-red-400", bg: "bg-red-500/20", glow: "shadow-red-500/30" };
    default:
      return { text: "text-gray-400", bg: "bg-gray-500/20", glow: "shadow-gray-500/30" };
  }
}

/**
 * Formats a duration in milliseconds to a human-readable string.
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

/**
 * Formats an ISO date string to a readable local date/time.
 */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Truncates a string to a max length with ellipsis.
 */
export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen) + "…";
}

/**
 * Extracts the domain name from a URL for display.
 */
export function extractDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

/**
 * Validates that a URL string is a valid HTTP/HTTPS URL.
 */
export function isValidUrl(url: string): boolean {
  try {
    const normalized = url.startsWith("http") ? url : "https://" + url;
    const parsed = new URL(normalized);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Returns a letter grade label with description.
 */
export function gradeInfo(grade: string): { label: string; description: string } {
  switch (grade) {
    case "A+": return { label: "A+", description: "Excellent security posture" };
    case "A": return { label: "A", description: "Strong security implementation" };
    case "B": return { label: "B", description: "Good security, minor issues" };
    case "C": return { label: "C", description: "Average security, improvements needed" };
    case "D": return { label: "D", description: "Poor security, significant risks" };
    case "F": return { label: "F", description: "Critical vulnerabilities present" };
    default: return { label: "?", description: "Unknown" };
  }
}

/**
 * Generates a fake scan progress message for the loading animation.
 */
export function getScanMessages(): string[] {
  return [
    "Initializing security scanner...",
    "Resolving DNS and establishing connection...",
    "Checking HTTPS and SSL certificate...",
    "Analyzing HTTP response headers...",
    "Scanning for missing security headers...",
    "Analyzing Content-Security-Policy...",
    "Checking cookie security flags...",
    "Testing clickjacking protections...",
    "Detecting technology stack...",
    "Fetching robots.txt and sitemap...",
    "Probing for sensitive path exposure...",
    "Scanning for information disclosure...",
    "Extracting and analyzing emails...",
    "Calculating security score...",
    "Generating vulnerability report...",
    "Finalizing results...",
  ];
}
