"use client";

/**
 * MAIN PAGE (Home)
 * ================
 * Orchestrates the full application flow:
 *   1. Landing hero with scan input
 *   2. Scan progress animation
 *   3. Results dashboard
 *   4. Feature & how-it-works sections
 *
 * State machine: idle → scanning → results → idle (rescan)
 */

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ScanResult } from "@/utils/scanner";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ScanProgress from "@/components/ScanProgress";
import ScanResults from "@/components/ScanResults";
import HowItWorks from "@/components/HowItWorks";
import Features from "@/components/Features";
import Footer from "@/components/Footer";

type AppState = "idle" | "scanning" | "results" | "error";

export default function HomePage() {
  const [appState, setAppState] = useState<AppState>("idle");
  const [currentUrl, setCurrentUrl] = useState<string>("");
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Ref to scroll to scanner results
  const scanSectionRef = useRef<HTMLDivElement>(null);

  /**
   * Handles the scan form submission.
   * Calls the /api/scan endpoint and updates state accordingly.
   */
  async function handleScan(url: string) {
    setCurrentUrl(url);
    setAppState("scanning");
    setErrorMessage("");

    // Scroll to the scan section smoothly
    setTimeout(() => {
      scanSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);

    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        // API returned an error
        setErrorMessage(data.error || "An error occurred during scanning.");
        setAppState("error");
        return;
      }

      // Success — show results
      setScanResult(data as ScanResult);
      setAppState("results");

      // Scroll to results after a brief moment
      setTimeout(() => {
        scanSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);

    } catch (err) {
      // Network error or unexpected failure
      console.error("Scan request failed:", err);
      setErrorMessage(
        "Unable to complete the scan. Please check your connection and try again."
      );
      setAppState("error");
    }
  }

  /**
   * Resets to idle state to allow a new scan.
   */
  function handleRescan() {
    setScanResult(null);
    setAppState("idle");
    setCurrentUrl("");
    // Scroll back to hero
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Fixed navbar */}
      <Navbar />

      {/* ═══════════════════════════════════════════
          HERO + SCANNER SECTION
          Always visible at the top
      ═══════════════════════════════════════════ */}
      <main className="flex-1">
        {/* Hero with URL input (hide when showing results) */}
        <AnimatePresence>
          {(appState === "idle" || appState === "scanning" || appState === "error") && (
            <motion.div
              key="hero"
              initial={false}
              exit={{ opacity: 0, height: 0 }}
            >
              <Hero
                onScan={handleScan}
                isScanning={appState === "scanning"}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Scan area (progress / results / error) ── */}
        <div
          ref={scanSectionRef}
          className="px-4 py-8 max-w-6xl mx-auto"
        >
          <AnimatePresence mode="wait">

            {/* Scanning state */}
            {appState === "scanning" && (
              <motion.div
                key="progress"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex justify-center"
              >
                <ScanProgress url={currentUrl} />
              </motion.div>
            )}

            {/* Results state */}
            {appState === "results" && scanResult && (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Results header */}
                <div className="mb-8 text-center">
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/5 mb-3"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="font-mono text-xs text-cyan-400 tracking-wider uppercase">
                      Scan Complete
                    </span>
                  </motion.div>
                  <h2 className="font-orbitron text-2xl sm:text-3xl font-bold text-white">
                    Security Report
                  </h2>
                </div>

                <ScanResults result={scanResult} onRescan={handleRescan} />
              </motion.div>
            )}

            {/* Error state */}
            {appState === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center"
              >
                <div className="w-full max-w-lg glass rounded-xl border border-red-500/20 bg-red-500/5 p-8 text-center">
                  {/* Error icon */}
                  <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-5">
                    <span className="text-2xl">⚠️</span>
                  </div>

                  <h3 className="font-orbitron text-lg font-bold text-red-400 mb-3">
                    Scan Failed
                  </h3>
                  <p className="text-sm text-cyber-muted mb-6 leading-relaxed">
                    {errorMessage}
                  </p>

                  {/* Common reasons */}
                  <div className="text-left bg-cyber-bg/40 rounded-lg border border-cyber-border p-4 mb-6 space-y-2">
                    <p className="text-xs font-mono text-cyber-muted uppercase tracking-wider mb-2">
                      Common reasons:
                    </p>
                    {[
                      "The website may be blocking automated requests",
                      "The domain doesn't exist or has no web server",
                      "The scan timed out (server too slow to respond)",
                      "The URL may be malformed — try adding https://",
                    ].map(reason => (
                      <div key={reason} className="flex items-start gap-2 text-xs text-cyber-muted">
                        <span className="text-red-400 mt-0.5">·</span>
                        {reason}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleRescan}
                    className="btn-cyber btn-cyber-primary w-full justify-center"
                  >
                    Try Again
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Info sections (only show on idle/error, not during scan) ── */}
        <AnimatePresence>
          {(appState === "idle" || appState === "error") && (
            <motion.div
              key="info-sections"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="section-divider max-w-6xl mx-auto" />
              <HowItWorks />
              <div className="section-divider max-w-6xl mx-auto" />
              <Features />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
