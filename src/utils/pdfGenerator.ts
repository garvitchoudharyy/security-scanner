**
 * PDF REPORT GENERATOR
 * ====================
 * Generates a professional security report PDF using jsPDF.
 * This runs entirely in the browser — no server needed.
 */

import type { ScanResult } from "./scanner";
import { formatDate, formatDuration } from "./helpers";

/**
 * Generates and downloads a PDF security report.
 * Uses dynamic import to avoid SSR issues.
 */
export async function generatePDFReport(result: ScanResult): Promise<void> {
  // Dynamic import to avoid SSR bundle issues
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  // ---- COLOR PALETTE ----
  const colors = {
    bg: [2, 4, 9] as [number, number, number],
    surface: [6, 13, 26] as [number, number, number],
    card: [10, 22, 40] as [number, number, number],
    cyan: [0, 212, 255] as [number, number, number],
    green: [0, 255, 136] as [number, number, number],
    red: [255, 51, 102] as [number, number, number],
    orange: [255, 100, 0] as [number, number, number],
    yellow: [255, 170, 0] as [number, number, number],
    white: [200, 216, 240] as [number, number, number],
    muted: [74, 96, 128] as [number, number, number],
    border: [15, 32, 64] as [number, number, number],
  };

  function getSeverityColor(sev: string): [number, number, number] {
    switch (sev) {
      case "critical": return colors.red;
      case "high": return colors.orange;
      case "medium": return colors.yellow;
      case "low": return colors.cyan;
      default: return [124, 58, 237];
    }
  }

  function getScoreColor(score: number): [number, number, number] {
    if (score >= 80) return colors.green;
    if (score >= 60) return colors.cyan;
    if (score >= 40) return colors.yellow;
    if (score >= 20) return colors.orange;
    return colors.red;
  }

  let y = 0; // Current Y position

  // Helper to add a new page if needed
  function checkPageBreak(neededHeight: number) {
    if (y + neededHeight > pageHeight - 20) {
      doc.addPage();
      // Add dark background to new page
      doc.setFillColor(...colors.bg);
      doc.rect(0, 0, pageWidth, pageHeight, "F");
      y = margin;
    }
  }

  // ============================================================
  // PAGE 1: COVER PAGE
  // ============================================================

  // Dark background
  doc.setFillColor(...colors.bg);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // Top accent bar
  doc.setFillColor(...colors.cyan);
  doc.rect(0, 0, pageWidth, 1.5, "F");

// Shield icon area (simulated with geometric shapes)
  doc.setFillColor(...colors.surface);
  doc.roundedRect(pageWidth / 2 - 15, 20, 30, 30, 3, 3, "F");
  doc.setFillColor(...colors.cyan);
  doc.setFontSize(20);
  doc.text("🛡", pageWidth / 2, 38, { align: "center" });

  // Title
  doc.setFontSize(28);
  doc.setTextColor(...colors.cyan);
  doc.text("SECURESCAN PRO", pageWidth / 2, 65, { align: "center" });

  doc.setFontSize(12);
  doc.setTextColor(...colors.muted);
  doc.text("WEBSITE SECURITY ASSESSMENT REPORT", pageWidth / 2, 73, { align: "center" });

  // Divider
  doc.setDrawColor(...colors.cyan);
  doc.setLineWidth(0.3);
  doc.line(margin, 80, pageWidth - margin, 80);

  // Target info box
  doc.setFillColor(...colors.card);
  doc.roundedRect(margin, 88, contentWidth, 40, 2, 2, "F");
  doc.setDrawColor(...colors.border);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, 88, contentWidth, 40, 2, 2, "D");

  doc.setFontSize(8);
  doc.setTextColor(...colors.muted);
  doc.text("TARGET URL", margin + 8, 96);
  doc.setFontSize(11);
  doc.setTextColor(...colors.white);
  doc.text(result.url, margin + 8, 103);

  doc.setFontSize(8);
  doc.setTextColor(...colors.muted);
  doc.text("SCAN DATE", margin + 8, 114);
  doc.setFontSize(10);
  doc.setTextColor(...colors.white);
  doc.text(formatDate(result.scannedAt), margin + 8, 120);

  doc.setFontSize(8);
  doc.setTextColor(...colors.muted);
  doc.text("SCAN DURATION", pageWidth / 2 + 8, 114);
  doc.setFontSize(10);
  doc.setTextColor(...colors.white);
  doc.text(formatDuration(result.scanDuration), pageWidth / 2 + 8, 120);

  // Score display
  const scoreColor = getScoreColor(result.overallScore);
  doc.setFillColor(...scoreColor);
  doc.circle(pageWidth / 2, 160, 22, "F");
  doc.setFillColor(...colors.bg);
  doc.circle(pageWidth / 2, 160, 18, "F");
  doc.setFontSize(22);
  doc.setTextColor(...scoreColor);
  doc.text(String(result.overallScore), pageWidth / 2, 165, { align: "center" });
  doc.setFontSize(7);
  doc.setTextColor(...colors.muted);
  doc.text("SECURITY SCORE", pageWidth / 2, 173, { align: "center" });

  // Grade and Risk Level
  doc.setFontSize(36);
  doc.setTextColor(...scoreColor);
  doc.text(result.grade, pageWidth / 4, 168, { align: "center" });
  doc.setFontSize(8);
  doc.setTextColor(...colors.muted);
  doc.text("GRADE", pageWidth / 4, 175, { align: "center" });

  doc.setFontSize(24);
  doc.setTextColor(...scoreColor);
  doc.text(result.riskLevel.toUpperCase(), (pageWidth * 3) / 4, 165, { align: "center" });
  doc.setFontSize(8);
  doc.setTextColor(...colors.muted);
  doc.text("RISK LEVEL", (pageWidth * 3) / 4, 175, { align: "center" });

  // Vulnerability summary boxes
const vulnStats = [
    { label: "CRITICAL", count: result.summary.critical, color: colors.red },
    { label: "HIGH", count: result.summary.high, color: colors.orange },
    { label: "MEDIUM", count: result.summary.medium, color: colors.yellow },
    { label: "LOW", count: result.summary.low, color: colors.cyan },
  ];

  const boxW = (contentWidth - 9) / 4;
  vulnStats.forEach((stat, i) => {
    const bx = margin + i * (boxW + 3);
    const by = 190;
    doc.setFillColor(...colors.surface);
    doc.roundedRect(bx, by, boxW, 22, 1, 1, "F");
    doc.setDrawColor(...stat.color);
    doc.setLineWidth(0.5);
    doc.roundedRect(bx, by, boxW, 22, 1, 1, "D");
    doc.setFontSize(16);
    doc.setTextColor(...stat.color);
    doc.text(String(stat.count), bx + boxW / 2, by + 13, { align: "center" });
    doc.setFontSize(6);
    doc.setTextColor(...colors.muted);
    doc.text(stat.label, bx + boxW / 2, by + 19, { align: "center" });
  });

  // Bottom divider & footer
  doc.setDrawColor(...colors.border);
  doc.setLineWidth(0.3);
  doc.line(margin, 230, pageWidth - margin, 230);

  doc.setFontSize(8);
  doc.setTextColor(...colors.muted);
  doc.text("CONFIDENTIAL — FOR AUTHORIZED USE ONLY", pageWidth / 2, 240, { align: "center" });
  doc.text("Generated by SecureScan Pro | Made with ❤️ by Garvit Choudhary", pageWidth / 2, 248, { align: "center" });

  // Bottom accent bar
  doc.setFillColor(...colors.cyan);
  doc.rect(0, pageHeight - 1.5, pageWidth, 1.5, "F");

  // ============================================================
  // PAGE 2: EXECUTIVE SUMMARY
  // ============================================================
  doc.addPage();
  doc.setFillColor(...colors.bg);
  doc.rect(0, 0, pageWidth, pageHeight, "F");
  doc.setFillColor(...colors.cyan);
  doc.rect(0, 0, pageWidth, 1.5, "F");

  y = margin;

  // Page title
  doc.setFontSize(14);
  doc.setTextColor(...colors.cyan);
  doc.text("EXECUTIVE SUMMARY", margin, y + 8);
  doc.setDrawColor(...colors.border);
  doc.setLineWidth(0.3);
  doc.line(margin, y + 11, pageWidth - margin, y + 11);
  y += 18;

  // Summary text
  doc.setFontSize(9);
  doc.setTextColor(...colors.white);
  const summaryLines = [
    `This security assessment was conducted on ${formatDate(result.scannedAt)} for the target ${result.url}.`,
    `The scan completed in ${formatDuration(result.scanDuration)} and evaluated ${result.summary.totalChecks} security checks.`,
    "",
    `OVERALL SECURITY POSTURE: ${result.riskLevel.toUpperCase()} RISK`,
    "",
    `The target received an overall security score of ${result.overallScore}/100 (Grade: ${result.grade}).`,
    `A total of ${result.summary.totalVulnerabilities} security issues were identified, including ${result.summary.critical} critical,`,
    `${result.summary.high} high, ${result.summary.medium} medium, ${result.summary.low} low severity issues, and ${result.summary.info} informational findings.`,
    "",
    "KEY FINDINGS:",
    `• HTTPS: ${result.isHttps ? "✓ Enabled" : "✗ Not enabled — all traffic is unencrypted"}`,
    `• HSTS: ${result.hasHSTS ? "✓ Configured" : "✗ Missing — browsers may access site via HTTP"}`,
    `• Content Security Policy: ${result.hasCSP ? "✓ Present" : "✗ Missing — XSS protection not enforced"}`,
    `• Clickjacking Protection: ${result.clickjackingProtection ? "✓ Protected" : "✗ Vulnerable to clickjacking"}`,
    `• Security Headers: ${result.securityHeaders.filter(h => h.present).length}/${result.securityHeaders.length} present`,
    `• Cookies Analyzed: ${result.cookies.length} cookie(s)`,
    `• Technologies Detected: ${result.technologies.map(t => t.name).join(", ") || "None detected"}`,
  ];

  summaryLines.forEach(line => {
    if (line === "") { y += 4; return; }
    if (line.startsWith("OVERALL") || line.startsWith("KEY FINDINGS")) {
      doc.setTextColor(...colors.cyan);
      doc.setFontSize(9);
    } else if (line.startsWith("•")) {
      doc.setTextColor(...colors.white);
      doc.setFontSize(9);
    } else {
      doc.setTextColor(...colors.muted);
      doc.setFontSize(9);
    }
    doc.text(line, margin, y);
    y += 6;
  });

  y += 8;

  // Category scores table
  doc.setFontSize(12);
  doc.setTextColor(...colors.cyan);
  doc.text("CATEGORY SCORES", margin, y);
  doc.setDrawColor(...colors.border);
  doc.line(margin, y + 3, pageWidth - margin, y + 3);
  y += 10;

  const catScores = [
    ["Security Headers", result.categoryScores.headers],
    ["SSL/TLS", result.categoryScores.ssl],
    ["Cookie Security", result.categoryScores.cookies],
    ["Content Security", result.categoryScores.content],
    ["Information Disclosure", result.categoryScores.information],
  ];

  catScores.forEach(([cat, score]) => {
    const barWidth = ((score as number) / 100) * (contentWidth - 60);
    const barColor = getScoreColor(score as number);

    doc.setFontSize(8);
    doc.setTextColor(...colors.white);
    doc.text(cat as string, margin, y);
    doc.setTextColor(...barColor);
    doc.text(`${score}%`, pageWidth - margin, y, { align: "right" });

    // Background bar
    doc.setFillColor(...colors.surface);
    doc.roundedRect(margin, y + 2, contentWidth - 20, 3, 0.5, 0.5, "F");

    // Score bar
    doc.setFillColor(...barColor);
    doc.roundedRect(margin, y + 2, barWidth, 3, 0.5, 0.5, "F");

    y += 10;
  });

  // ============================================================
  // PAGE 3: VULNERABILITIES
  // ============================================================
  doc.addPage();
  doc.setFillColor(...colors.bg);
  doc.rect(0, 0, pageWidth, pageHeight, "F");
  doc.setFillColor(...colors.cyan);
  doc.rect(0, 0, pageWidth, 1.5, "F");

  y = margin;
  doc.setFontSize(14);
  doc.setTextColor(...colors.cyan);
  doc.text("VULNERABILITY DETAILS", margin, y + 8);
  doc.setDrawColor(...colors.border);
  doc.line(margin, y + 11, pageWidth - margin, y + 11);
  y += 20;

  // Sort by severity
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
  const sortedVulns = [...result.vulnerabilities].sort(
    (a, b) => severityOrder[a.severity] - severityOrder[b.severity]
  );

  for (const vuln of sortedVulns) {
    checkPageBreak(50);
   
    const sevColor = getSeverityColor(vuln.severity);

    // Vulnerability header
    doc.setFillColor(...colors.surface);
    doc.roundedRect(margin, y, contentWidth, 10, 1, 1, "F");
    doc.setFillColor(...sevColor);
    doc.roundedRect(margin, y, 3, 10, 0, 0, "F");

    doc.setFontSize(9);
    doc.setTextColor(...sevColor);
    doc.text(vuln.severity.toUpperCase(), margin + 8, y + 7);

    doc.setTextColor(...colors.white);
    doc.text(vuln.title, margin + 30, y + 7);

    doc.setTextColor(...colors.muted);
    doc.text(vuln.category, pageWidth - margin, y + 7, { align: "right" });

    y += 14;

    // Description
    doc.setFontSize(8);
    doc.setTextColor(...colors.muted);
    doc.text("DESCRIPTION:", margin, y);
    y += 5;
    doc.setTextColor(...colors.white);
    const descLines = doc.splitTextToSize(vuln.description, contentWidth);
    doc.text(descLines, margin, y);
    y += descLines.length * 4.5 + 3;

    // Recommendation
    checkPageBreak(25);
    doc.setFontSize(8);
    doc.setTextColor(...colors.cyan);
    doc.text("RECOMMENDATION:", margin, y);
    y += 5;
    doc.setTextColor(...colors.white);
    const recLines = doc.splitTextToSize(vuln.recommendation, contentWidth);
    doc.text(recLines, margin, y);
    y += recLines.length * 4.5 + 8;

    // Separator
    doc.setDrawColor(...colors.border);
    doc.setLineWidth(0.2);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;
  }

  // ============================================================
  // PAGE 4: SECURITY HEADERS & TECHNICAL DETAILS
  // ============================================================
  doc.addPage();
  doc.setFillColor(...colors.bg);
  doc.rect(0, 0, pageWidth, pageHeight, "F");
  doc.setFillColor(...colors.cyan);
  doc.rect(0, 0, pageWidth, 1.5, "F");

  y = margin;
  doc.setFontSize(14);
  doc.setTextColor(...colors.cyan);
  doc.text("SECURITY HEADERS ANALYSIS", margin, y + 8);
  doc.setDrawColor(...colors.border);
  doc.line(margin, y + 11, pageWidth - margin, y + 11);
  y += 20;

  // Headers table
  autoTable(doc, {
    startY: y,
    head: [["Header", "Status", "Severity", "Current Value"]],
    body: result.securityHeaders.map(h => [
      h.name,
      h.present ? "✓ PRESENT" : "✗ MISSING",
      h.severity.toUpperCase(),
      h.value ? (h.value.length > 40 ? h.value.slice(0, 40) + "..." : h.value) : "Not set",
    ]),
    styles: {
      fillColor: colors.surface,
      textColor: colors.white,
      fontSize: 7,
      cellPadding: 3,
      },
    headStyles: {
      fillColor: colors.card,
      textColor: colors.cyan,
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: [8, 18, 34],
    },
    columnStyles: {
      1: {
        cellWidth: 22,
      },
      2: {
        cellWidth: 20,
      },
    },
    didParseCell: (data) => {
      if (data.column.index === 1 && data.section === "body") {
        const value = data.cell.text[0];
        if (value?.includes("PRESENT")) {
          data.cell.styles.textColor = colors.green;
        } else {
          data.cell.styles.textColor = colors.red;
        }
      }
    },
    margin: { left: margin, right: margin },
  });

  // @ts-ignore
  y = (doc as any).lastAutoTable.finalY + 15;

  // Technology stack
  if (result.technologies.length > 0) {
    checkPageBreak(40);
    doc.setFontSize(12);
    doc.setTextColor(...colors.cyan);
    doc.text("DETECTED TECHNOLOGIES", margin, y);
    doc.setDrawColor(...colors.border);
    doc.line(margin, y + 3, pageWidth - margin, y + 3);
    y += 12;

    autoTable(doc, {
      startY: y,
      head: [["Technology", "Category", "Confidence"]],
      body: result.technologies.map(t => [
        t.name + (t.version ? ` v${t.version}` : ""),
        t.category,
        t.confidence.toUpperCase(),
      ]),
      styles: {
        fillColor: colors.surface,
        textColor: colors.white,
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: colors.card,
        textColor: colors.cyan,
      },
      margin: { left: margin, right: margin },
    });
  }

  // Footer on every page
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFillColor(...colors.bg);
    doc.rect(0, pageHeight - 10, pageWidth, 10, "F");
    doc.setFontSize(7);
    doc.setTextColor(...colors.muted);
    doc.text(
      `SecureScan Pro | ${result.url} | ${formatDate(result.scannedAt)} | Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 4,
      { align: "center" }
    );
    doc.setFillColor(...colors.cyan);
    doc.rect(0, pageHeight - 1.5, pageWidth, 1.5, "F");
  }

  // Save the PDF
  const domain = new URL(result.url.startsWith("http") ? result.url : "https://" + result.url).hostname;
  const filename = `SecureScan-${domain}-${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(filename);
}
  
