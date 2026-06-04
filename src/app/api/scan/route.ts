/**
 * SCAN API ROUTE
 * ==============
 * Next.js App Router API route that receives scan requests,
 * validates the URL, runs the scanner, and returns results.
 *
 * POST /api/scan
 * Body: { url: string }
 * Returns: ScanResult JSON
 */

import { NextRequest, NextResponse } from "next/server";
import { scanWebsite } from "@/utils/scanner";

// Allow up to 30 seconds (Vercel hobby plan limit)
export const maxDuration = 30;

// Configure runtime as Node.js (not edge) for full fetch support
export const runtime = "nodejs";

/**
 * Validates that a URL is safe to scan.
 * Blocks localhost, private IPs, and invalid URLs.
 */
function validateUrl(url: string): { valid: boolean; message?: string; normalizedUrl?: string } {
  try {
    let normalized = url.trim();
    if (!normalized.startsWith("http://") && !normalized.startsWith("https://")) {
      normalized = "https://" + normalized;
    }

    const parsed = new URL(normalized);

    // Block non-HTTP protocols
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return { valid: false, message: "Only HTTP and HTTPS URLs are allowed." };
    }

    const hostname = parsed.hostname.toLowerCase();

    // Block localhost and loopback
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "::1" ||
      hostname.endsWith(".localhost")
    ) {
      return { valid: false, message: "Scanning localhost is not allowed." };
    }

    // Block private IP ranges (basic check)
    if (
      /^10\.\d+\.\d+\.\d+$/.test(hostname) ||
      /^192\.168\.\d+\.\d+$/.test(hostname) ||
      /^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/.test(hostname) ||
      hostname === "0.0.0.0"
    ) {
      return { valid: false, message: "Scanning private/internal IP addresses is not allowed." };
    }

    // Must have a valid TLD
    const parts = hostname.split(".");
    if (parts.length < 2 || parts[parts.length - 1].length < 2) {
      return { valid: false, message: "Please enter a valid domain name (e.g., example.com)." };
    }

    return { valid: true, normalizedUrl: normalized };
  } catch {
    return { valid: false, message: "Invalid URL format. Please enter a valid URL." };
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json().catch(() => null);

    if (!body || typeof body.url !== "string") {
      return NextResponse.json(
        { error: "Request body must contain a 'url' field." },
        { status: 400 }
      );
    }

    // Validate URL
    const validation = validateUrl(body.url);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.message },
        { status: 400 }
      );
    }

    const url = validation.normalizedUrl!;

    console.log(`[SecureScan] Starting scan for: ${url}`);
    const startTime = Date.now();

    // Run the scanner
    const result = await scanWebsite(url);

    console.log(
      `[SecureScan] Completed scan for: ${url} | Score: ${result.overallScore} | Duration: ${Date.now() - startTime}ms`
    );

    return NextResponse.json(result, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store", // Never cache scan results
      },
    });
  } catch (error) {
    console.error("[SecureScan] Scan error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred during scanning.";

    return NextResponse.json(
      {
        error: message.includes("Unable to reach")
          ? message
          : "Failed to scan the website. Please check the URL and try again.",
        details: process.env.NODE_ENV === "development" ? message : undefined,
      },
      { status: 500 }
    );
  }
}

// Handle preflight CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
