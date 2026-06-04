"use client";

/**
 * FOOTER COMPONENT
 * ================
 * Professional footer with links and attribution.
 */

import { Shield, Github, Twitter, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-cyber-border bg-cyber-surface/30 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-cyan-500/10 border border-cyan-500/30 rounded flex items-center justify-center">
                <Shield className="w-4 h-4 text-cyan-400" />
              </div>
              <span className="font-orbitron font-bold text-sm">
                <span className="text-cyan-400">SECURE</span>
                <span className="text-white">SCAN PRO</span>
              </span>
            </div>
            <p className="text-xs text-cyber-muted leading-relaxed max-w-xs">
              Professional website security scanning tool. Detect vulnerabilities,
              analyze security headers, and get actionable fix recommendations — free.
            </p>
          </div>

          {/* Checks */}
          <div>
            <h4 className="text-xs font-mono text-cyber-muted uppercase tracking-widest mb-4">Security Checks</h4>
            <ul className="space-y-2">
              {[
                "SSL/TLS Certificate",
                "Security Headers (HSTS, CSP, etc.)",
                "Cookie Security Flags",
                "Clickjacking Protection",
                "Technology Detection",
                "Information Disclosure",
                "robots.txt Analysis",
              ].map(item => (
                <li key={item} className="text-xs text-cyber-muted flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-cyan-500/50" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs font-mono text-cyber-muted uppercase tracking-widest mb-4">Security Resources</h4>
            <ul className="space-y-2">
              {[
                { label: "OWASP Top 10", href: "https://owasp.org/www-project-top-ten/" },
                { label: "Mozilla Security Guidelines", href: "https://infosec.mozilla.org/guidelines/web_security" },
                { label: "Security Headers Reference", href: "https://securityheaders.com/" },
                { label: "Content Security Policy", href: "https://content-security-policy.com/" },
                { label: "HSTS Preload List", href: "https://hstspreload.org/" },
                { label: "SSL Labs", href: "https://www.ssllabs.com/ssltest/" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-cyber-muted hover:text-cyan-400 transition-colors flex items-center gap-1.5"
                  >
                    <div className="w-1 h-1 rounded-full bg-cyan-500/50" />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="section-divider mb-6" />

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-cyber-muted font-mono text-center sm:text-left">
            © {new Date().getFullYear()} SecureScan Pro. Open source. No data stored. No tracking.
          </div>

          {/* Made with love attribution */}
          <div className="flex items-center gap-1.5 text-xs font-mono text-cyber-muted">
            Made with{" "}
            <Heart className="w-3 h-3 text-red-400 fill-red-400 inline" />{" "}
            by{" "}
            <span className="text-cyan-400 font-semibold">Garvit Choudhary</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-cyber-muted">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono">All systems operational</span>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 p-4 rounded-lg border border-cyber-border bg-cyber-card/20">
          <p className="text-[10px] text-cyber-muted/60 text-center leading-relaxed font-mono">
            ⚠ DISCLAIMER: SecureScan Pro is intended for security research and testing of websites you own or have explicit permission to scan.
            Unauthorized scanning of websites may violate applicable laws. Always obtain proper authorization before scanning.
            This tool performs passive analysis only and does not exploit vulnerabilities.
          </p>
        </div>
      </div>
    </footer>
  );
}
