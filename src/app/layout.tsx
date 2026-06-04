import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SecureScan Pro — Website Security Scanner",
  description:
    "Professional website security scanner. Detect vulnerabilities, analyze security headers, SSL certificates, and generate comprehensive security reports instantly.",
  keywords: "website security scanner, vulnerability scanner, SSL check, security headers, XSS detection, HTTPS check",
  openGraph: {
    title: "SecureScan Pro — Website Security Scanner",
    description: "Scan any website for security vulnerabilities in seconds.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Preconnect to Google Fonts for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Favicon as SVG emoji */}
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🛡️</text></svg>" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}

