/**
 * SECURITY SCANNER CORE ENGINE
 * ============================
 * This module performs all actual security checks against a target website.
 * It uses Node.js built-in fetch (available in Next.js API routes) to make
 * real HTTP requests and analyze the responses for security issues.
 *
 * All checks are based on OWASP security standards and industry best practices.
 */

// ============================================================
// TYPE DEFINITIONS
// ============================================================

export type Severity = "critical" | "high" | "medium" | "low" | "info";

export interface Vulnerability {
  id: string;
  title: string;
  severity: Severity;
  category: string;
  description: string;
  impact: string;
  recommendation: string;
  references: string[];
  found: boolean;
  value?: string; // The actual header/cookie value found (or missing)
}

export interface HeaderCheck {
  name: string;
  present: boolean;
  value?: string;
  severity: Severity;
  recommendation: string;
}

export interface CookieCheck {
  name: string;
  hasSecure: boolean;
  hasHttpOnly: boolean;
  hasSameSite: boolean;
  sameSiteValue?: string;
}

export interface TechStack {
  name: string;
  version?: string;
  category: string;
  confidence: "high" | "medium" | "low";
}

export interface ScanResult {
  url: string;
  scannedAt: string;
  scanDuration: number;

  // Core findings
  overallScore: number;
  riskLevel: "Critical" | "High" | "Medium" | "Low" | "Excellent";
  grade: string; // A+, A, B, C, D, F

  // HTTP info
  finalUrl: string;          // URL after redirects
  statusCode: number;
  responseTime: number;
  isHttps: boolean;
  httpRedirectsToHttps: boolean;
  serverHeader?: string;
  poweredByHeader?: string;

  // Security headers
  securityHeaders: HeaderCheck[];

  // SSL info
  ssl: {
    present: boolean;
    protocol?: string;
    error?: string;
  };
  
  // Cookie analysis
  cookies: CookieCheck[];

  // Content analysis
  hasCSP: boolean;
  cspValue?: string;
  hasXFrameOptions: boolean;
  xFrameOptionsValue?: string;
  hasHSTS: boolean;
  hstsValue?: string;
  hasXContentTypeOptions: boolean;
  hasReferrerPolicy: boolean;

  // Specific checks
  robotsTxt: {
    found: boolean;
    content?: string;
    exposesSensitivePaths: boolean;
    sensitivePaths: string[];
  };

  sitemap: {
    found: boolean;
    url?: string;
  };

  openRedirect: boolean;
  serverInfoExposed: boolean;
  clickjackingProtection: boolean;
  mixedContent: boolean;

  // Technology detection
  technologies: TechStack[];

  // Email exposure
  emailsFound: string[];

  // Sensitive paths found
  sensitivePaths: {
    path: string;
    accessible: boolean;
    statusCode: number;
  }[];

  // All vulnerabilities compiled
  vulnerabilities: Vulnerability[];

  // Executive summary
  summary: {
  totalVulnerabilities: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
    passedChecks: number;
    totalChecks: number;
  };

  // Category scores
  categoryScores: {
    headers: number;
    ssl: number;
    cookies: number;
    content: number;
    information: number;
  };
}

// ============================================================
// CONSTANTS
// ============================================================

// Sensitive paths to probe for exposure
const SENSITIVE_PATHS = [
  "/.env",
  "/.git/config",
  "/wp-admin/",
  "/admin/",
  "/phpinfo.php",
  "/server-status",
  "/.htaccess",
  "/config.php",
  "/wp-config.php",
  "/backup.zip",
  "/robots.txt",
  "/sitemap.xml",
  "/.well-known/security.txt",
];

// Security headers that should be present
const REQUIRED_SECURITY_HEADERS = [
  {
    name: "strict-transport-security",
    title: "Strict-Transport-Security (HSTS)",
    severity: "high" as Severity,
    recommendation:
      "Add: Strict-Transport-Security: max-age=31536000; includeSubDomains; preload",
  },
  {
    name: "content-security-policy",
    title: "Content-Security-Policy (CSP)",
    severity: "high" as Severity,
    recommendation:
      "Implement a Content Security Policy to prevent XSS and data injection attacks.",
  },
  {
    name: "x-frame-options",
    title: "X-Frame-Options",
    severity: "medium" as Severity,
    recommendation:
      "Add: X-Frame-Options: DENY or SAMEORIGIN to prevent clickjacking.",
  },
  {
    name: "x-content-type-options",
    title: "X-Content-Type-Options",
    severity: "medium" as Severity,
    recommendation: "Add: X-Content-Type-Options: nosniff",
  },
  {
    name: "referrer-policy",
    title: "Referrer-Policy",
    severity: "low" as Severity,
    recommendation:
      "Add: Referrer-Policy: strict-origin-when-cross-origin",
  },
  {
    name: "permissions-policy",
    title: "Permissions-Policy",
    severity: "low" as Severity,
    recommendation:
      "Add Permissions-Policy to control browser features like camera, microphone, geolocation.",
  },
  {
    name: "x-xss-protection",
    title: "X-XSS-Protection",
    severity: "low" as Severity,
    recommendation:
      "Add: X-XSS-Protection: 1; mode=block (legacy browsers)",
  },
  {
    name: "cross-origin-opener-policy",
    title: "Cross-Origin-Opener-Policy (COOP)",
    severity: "low" as Severity,
    recommendation:
      "Add: Cross-Origin-Opener-Policy: same-origin",
  },
];

// Technology fingerprinting patterns
const TECH_FINGERPRINTS: {
  name: string;
  category: string;
  headers?: { key: string; pattern: RegExp }[];
  bodyPatterns?: RegExp[];
}[] = [
  {
    name: "WordPress",
    category: "CMS",
    bodyPatterns: [/wp-content\/themes/i, /wp-includes/i, /wordpress/i],
    headers: [{ key: "x-powered-by", pattern: /wordpress/i }],
  },
  {
    name: "Drupal",
    category: "CMS",
    bodyPatterns: [/Drupal\.settings/i, /drupal/i],
    headers: [{ key: "x-generator", pattern: /drupal/i }],
  },
  {
    name: "Joomla",
    category: "CMS",
    bodyPatterns: [/Joomla!/i, /\/components\/com_/i],
  },
  {
    name: "Next.js",
    category: "Framework",
    headers: [{ key: "x-powered-by", pattern: /next\.js/i }],
    bodyPatterns: [/__NEXT_DATA__/i, /_next\/static/i],
  },
  {
    name: "React",
    category: "Framework",
    bodyPatterns: [/__reactFiber/i, /react-root/i, /_reactRootContainer/i],
  },
  {
    name: "Vue.js",
    category: "Framework",
    bodyPatterns: [/__vue_app__/i, /vue-router/i, /vuex/i],
  },
  {
    name: "Angular",
    category: "Framework",
    bodyPatterns: [/ng-version/i, /angular/i, /ng-app/i],
  },
  {
    name: "jQuery",
    category: "Library",
    bodyPatterns: [/jquery/i, /jQuery v/i],
  },
  {
    name: "Bootstrap",
    category: "CSS Framework",
    bodyPatterns: [/bootstrap\.min\.css/i, /bootstrap\.css/i],
  },
  {
    name: "Nginx",
    category: "Web Server",
    headers: [{ key: "server", pattern: /nginx/i }],
  },
  {
    name: "Apache",
    category: "Web Server",
    headers: [{ key: "server", pattern: /apache/i }],
  },
  {
    name: "Node.js / Express",
    category: "Backend",
    headers: [{ key: "x-powered-by", pattern: /express/i }],
  },
  {
    name: "PHP",
    category: "Backend",
    headers: [{ key: "x-powered-by", pattern: /php/i }],
  },
  {
    name: "ASP.NET",
    category: "Backend",
    headers: [
      { key: "x-powered-by", pattern: /asp\.net/i },
      { key: "x-aspnet-version", pattern: /.+/ },
    ],
  },
  {
    name: "Cloudflare",
    category: "CDN / Security",
    headers: [
      { key: "cf-ray", pattern: /.+/ },
      { key: "server", pattern: /cloudflare/i },
    ],
  },
  {
    name: "Vercel",
    category: "Hosting",
    headers: [{ key: "x-vercel-id", pattern: /.+/ }],
  },
  {
    name: "AWS",
    category: "Hosting",
    headers: [{ key: "x-amz-cf-id", pattern: /.+/ }],
  },
  {
    name: "Shopify",
    category: "E-Commerce",
    headers: [{ key: "x-shopify-stage", pattern: /.+/ }],
    bodyPatterns: [/shopify/i, /cdn\.shopify\.com/i],
  },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Safely fetches a URL with timeout and error handling.
 * Returns null if the request fails.
 */
async function safeFetch(
  url: string,
  options: RequestInit = {}
): Promise<{ response: Response; body: string } | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; SecureScanPro/1.0; +security-scanner)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        ...options.headers,
      },
    });

    clearTimeout(timeout);
    const body = await response.text().catch(() => "");
    return { response, body };
  } catch {
    return null;
  }
}

/**
 * Parses Set-Cookie header values into a structured CookieCheck object.
 */
function parseCookie(cookieHeader: string): CookieCheck {
  const parts = cookieHeader.split(";").map((p) => p.trim());
  const name = parts[0]?.split("=")[0]?.trim() || "unknown";

  return {
    name,
    hasSecure: parts.some((p) => p.toLowerCase() === "secure"),
    hasHttpOnly: parts.some((p) => p.toLowerCase() === "httponly"),
    hasSameSite: parts.some((p) => p.toLowerCase().startsWith("samesite")),
    sameSiteValue: parts
      .find((p) => p.toLowerCase().startsWith("samesite"))
      ?.split("=")[1]
      ?.trim(),
  };
}

/**
 * Detects technology stack from response headers and body content.
 */
function detectTechnologies(
  headers: Headers,
  body: string
  ): TechStack[] {
  const detected: TechStack[] = [];

  for (const tech of TECH_FINGERPRINTS) {
    let confidence: "high" | "medium" | "low" = "low";
    let found = false;

    // Check headers
    if (tech.headers) {
      for (const headerCheck of tech.headers) {
        const headerValue = headers.get(headerCheck.key);
        if (headerValue && headerCheck.pattern.test(headerValue)) {
          found = true;
          confidence = "high";
          // Extract version from server header
          const versionMatch = headerValue.match(/[\d.]+/);
          if (versionMatch && confidence === "high") {
            detected.push({
              name: tech.name,
              category: tech.category,
              confidence,
              version: versionMatch[0],
            });
            found = false; // Already added
          }
          break;
        }
      }
    }

    // Check body patterns
    if (tech.bodyPatterns && body) {
      for (const pattern of tech.bodyPatterns) {
        if (pattern.test(body)) {
          found = true;
          confidence = confidence === "high" ? "high" : "medium";
          break;
        }
      }
    }

    if (found) {
      detected.push({
        name: tech.name,
        category: tech.category,
        confidence,
      });
    }
  }

  // Deduplicate
  const unique = detected.filter(
    (tech, idx, arr) => arr.findIndex((t) => t.name === tech.name) === idx
  );

  return unique;
}

/**
 * Extracts email addresses from HTML body content.
 */
function extractEmails(body: string): string[] {
  const emailRegex = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
  const found = body.match(emailRegex) || [];
  // Filter out common false positives
  const filtered = found.filter((email) => {
    const lower = email.toLowerCase();
    return (
      !lower.includes("example.com") &&
      !lower.includes("test.com") &&
      !lower.includes("sentry.io") &&
      !lower.includes("w3.org") &&
      !lower.includes("schema.org") &&
      !lower.endsWith(".png") &&
      !lower.endsWith(".svg") &&
      !lower.endsWith(".jpg")
    );
  });
  // Return unique emails (max 10 to avoid noise)
  return [...new Set(filtered)].slice(0, 10);
}

/**
 * Analyzes the robots.txt content for sensitive path disclosures.
 */
function analyzeRobotsTxt(content: string): { exposesSensitivePaths: boolean; sensitivePaths: string[] } {
  const sensitiveKeywords = [
    "/admin", "/wp-admin", "/backend", "/dashboard", "/api/", "/config",
    "/private", "/secret", "/internal", "/staging", "/dev", "/.git",
    "/backup", "/database", "/db", "/sql", "/phpmyadmin",
  ];

  const lines = content.split("\n").map((l) => l.trim());
  const disallowedPaths = lines
    .filter((l) => l.toLowerCase().startsWith("disallow:"))
    .map((l) => l.replace(/^disallow:\s*/i, "").trim());

  const sensitivePaths = disallowedPaths.filter((path) =>
    sensitiveKeywords.some((kw) => path.toLowerCase().includes(kw))
  );

  return {
    exposesSensitivePaths: sensitivePaths.length > 0,
    sensitivePaths,
  };
}

/**
 * Calculates security score based on various checks.
 * Returns a score between 0 and 100.
 */
function calculateScore(data: Partial<ScanResult>): {
  overallScore: number;
  riskLevel: "Critical" | "High" | "Medium" | "Low" | "Excellent";
  grade: string;
  categoryScores: ScanResult["categoryScores"];
} {
  // ---- HEADER SCORE (30 points) ----
  let headerScore = 0;
  const headerChecks = data.securityHeaders || [];
  const criticalHeaders = ["strict-transport-security", "content-security-policy"];
  const importantHeaders = ["x-frame-options", "x-content-type-options"];
  const niceHeaders = ["referrer-policy", "permissions-policy", "x-xss-protection"];

  for (const h of headerChecks) {
    if (h.present) {
      if (criticalHeaders.includes(h.name.toLowerCase())) headerScore += 8;
      else if (importantHeaders.includes(h.name.toLowerCase())) headerScore += 5;
      else headerScore += 2;
    }
  }
  headerScore = Math.min(30, headerScore);

  // ---- SSL SCORE (20 points) ----
  let sslScore = 0;
  if (data.isHttps) sslScore += 10;
  if (data.ssl?.present) sslScore += 5;
  if (data.httpRedirectsToHttps) sslScore += 5;
  if (data.hasHSTS) sslScore += 5;
  sslScore = Math.min(20, sslScore);

  // ---- COOKIE SCORE (20 points) ----
  let cookieScore = 20;
  const cookies = data.cookies || [];
  if (cookies.length > 0) {
    const cookieIssues = cookies.reduce((acc, cookie) => {
      if (!cookie.hasSecure) acc++;
      if (!cookie.hasHttpOnly) acc++;
      if (!cookie.hasSameSite) acc++;
      return acc;
    }, 0);
    const maxIssues = cookies.length * 3;
    cookieScore = maxIssues > 0
      ? Math.round(20 * (1 - cookieIssues / maxIssues))
      : 20;
  }
  cookieScore = Math.max(0, Math.min(20, cookieScore));

  // ---- CONTENT SCORE (20 points) ----
  let contentScore = 0;
  if (data.hasCSP) contentScore += 8;
  if (data.hasXFrameOptions) contentScore += 5;
  if (data.clickjackingProtection) contentScore += 3;
  if (!data.mixedContent) contentScore += 4;
  contentScore = Math.min(20, contentScore);

// ---- INFORMATION DISCLOSURE SCORE (10 points) ----
  let infoScore = 10;
  if (data.serverInfoExposed) infoScore -= 3;
  if (data.poweredByHeader) infoScore -= 3;
  if ((data.emailsFound?.length || 0) > 0) infoScore -= 2;
  if (data.robotsTxt?.exposesSensitivePaths) infoScore -= 2;
  infoScore = Math.max(0, infoScore);

  const overallScore = headerScore + sslScore + cookieScore + contentScore + infoScore;

  // Risk level classification
  let riskLevel: ScanResult["riskLevel"];
  let grade: string;

  if (overallScore >= 90) { riskLevel = "Excellent"; grade = "A+"; }
  else if (overallScore >= 80) { riskLevel = "Low"; grade = "A"; }
  else if (overallScore >= 70) { riskLevel = "Low"; grade = "B"; }
  else if (overallScore >= 55) { riskLevel = "Medium"; grade = "C"; }
  else if (overallScore >= 40) { riskLevel = "High"; grade = "D"; }
  else { riskLevel = "Critical"; grade = "F"; }

  return {
    overallScore: Math.round(overallScore),
    riskLevel,
    grade,
    categoryScores: {
      headers: Math.round((headerScore / 30) * 100),
      ssl: Math.round((sslScore / 20) * 100),
      cookies: Math.round((cookieScore / 20) * 100),
      content: Math.round((contentScore / 20) * 100),
      information: Math.round((infoScore / 10) * 100),
    },
  };
}

/**
 * Compiles all detected issues into structured Vulnerability objects.
 */
function compileVulnerabilities(data: Partial<ScanResult>): Vulnerability[] {
  const vulns: Vulnerability[] = [];

  // --- HTTPS Check ---
  vulns.push({
    id: "https-enforcement",
    title: "HTTPS Not Enforced",
    severity: "critical",
    category: "Transport Security",
    description: "The website does not use HTTPS, meaning all data transmitted between the user and server is sent in plaintext.",
    impact: "Attackers on the same network can intercept, read, and modify all traffic (Man-in-the-Middle attack). Passwords, session cookies, and sensitive data are exposed.",
    recommendation: "1. Obtain an SSL/TLS certificate (free via Let's Encrypt)\n2. Configure your web server to redirect all HTTP traffic to HTTPS\n3. Enable HSTS to prevent protocol downgrade attacks",
    references: ["https://owasp.org/www-project-top-ten/", "https://letsencrypt.org/"],
    found: !data.isHttps,
  });

  // --- HTTP to HTTPS Redirect ---
  if (data.isHttps) {
    vulns.push({
      id: "http-redirect",
      title: "HTTP Does Not Redirect to HTTPS",
      severity: "high",
      category: "Transport Security",
      description: "The site supports HTTPS but does not automatically redirect HTTP requests to HTTPS.",
      impact: "Users who access the site via HTTP will have their connection unencrypted unless they manually type HTTPS.",
      recommendation: "Configure a 301 permanent redirect from HTTP to HTTPS at the server level.",
      references: ["https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Strict_Transport_Security_Cheat_Sheet.html"],
      found: !data.httpRedirectsToHttps && data.isHttps === true,
    });
  }

  // --- Security Headers ---
  for (const header of data.securityHeaders || []) {
    if (!header.present) {
      const severity: Record<string, Severity> = {
        "strict-transport-security": "high",
        "content-security-policy": "high",
        "x-frame-options": "medium",
        "x-content-type-options": "medium",
        "referrer-policy": "low",
        "permissions-policy": "low",
        "x-xss-protection": "low",
        "cross-origin-opener-policy": "low",
      };

      const descriptions: Record<string, string> = {
        "strict-transport-security": "HSTS header is missing. This header instructs browsers to only access the site over HTTPS for a specified duration.",
        "content-security-policy": "CSP header is missing. This is a critical defense against Cross-Site Scripting (XSS) and data injection attacks.",
        "x-frame-options": "X-Frame-Options header is missing. Without it, the page can be embedded in iframes on other sites.",
        "x-content-type-options": "X-Content-Type-Options header is missing. Browsers may MIME-sniff responses, which can lead to XSS attacks.",
        "referrer-policy": "Referrer-Policy header is missing. The full URL may be sent as a referrer to third-party sites.",
        "permissions-policy": "Permissions-Policy header is missing. Browser features like camera and microphone are not explicitly controlled.",
        "x-xss-protection": "X-XSS-Protection header is missing. Legacy browser XSS filters are not enabled.",
        "cross-origin-opener-policy": "COOP header is missing. The site may be vulnerable to cross-origin information leaks.",
      };

      const impacts: Record<string, string> = {
        "strict-transport-security": "Users may be tricked into accessing an HTTP version of the site, exposing their data.",
        "content-security-policy": "Attackers can inject malicious scripts that steal data, hijack sessions, or deface the site.",
        "x-frame-options": "Clickjacking attacks can trick users into unknowingly clicking malicious UI elements overlaid on your site.",
        "x-content-type-options": "Attackers can exploit MIME type confusion to execute malicious content.",
        "referrer-policy": "Sensitive URL parameters (tokens, IDs) may leak to third-party sites.",
        "permissions-policy": "Malicious scripts may access camera, microphone, or geolocation without restriction.",
        "x-xss-protection": "Older browsers may not automatically block reflected XSS attacks.",
        "cross-origin-opener-policy": "Cross-origin attacks may be able to access window references to your pages.",
      };

      vulns.push({
        id: `missing-header-${header.name}`,
        title: `Missing Security Header: ${header.name.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join("-")}`,
        severity: severity[header.name.toLowerCase()] || "low",
        category: "Security Headers",
        description: descriptions[header.name.toLowerCase()] || `The ${header.name} header is not set.`,
        impact: impacts[header.name.toLowerCase()] || "Reduces the browser's ability to protect users.",
        recommendation: header.recommendation,
        references: ["https://securityheaders.com/", "https://owasp.org/"],
        found: true,
      });
    }
  }

  // --- CSP Analysis ---
  if (data.hasCSP && data.cspValue) {
    const csp = data.cspValue.toLowerCase();
    if (csp.includes("unsafe-inline")) {
      vulns.push({
        id: "csp-unsafe-inline",
        title: "Weak CSP: 'unsafe-inline' Detected",
        severity: "medium",
        category: "Content Security Policy",
        description: "The Content-Security-Policy header contains 'unsafe-inline', which allows inline scripts and styles.",
        impact: "Significantly reduces the effectiveness of CSP against XSS attacks, as inline script execution is permitted.",
        recommendation: "Replace 'unsafe-inline' with cryptographic nonces (nonce-'base64value') or hashes for each inline script.",
        references: ["https://content-security-policy.com/"],
        found: true,
        value: data.cspValue,
      });
    }
    if (csp.includes("unsafe-eval")) {
      vulns.push({
        id: "csp-unsafe-eval",
        title: "Weak CSP: 'unsafe-eval' Detected",
        severity: "medium",
        category: "Content Security Policy",
        description: "The CSP allows 'unsafe-eval', enabling dynamic code evaluation via eval().",
        impact: "Allows attackers to execute injected code if any part of the application uses eval() with untrusted data.",
        recommendation: "Remove 'unsafe-eval' and refactor code that relies on eval(), setTimeout with strings, or similar dynamic execution.",
        references: ["https://content-security-policy.com/unsafe-eval/"],
        found: true,
        value: data.cspValue,
      });
    }
    if (csp.includes("*")) {
      vulns.push({
        id: "csp-wildcard",
        title: "Weak CSP: Wildcard Source (*) Detected",
        severity: "medium",
        category: "Content Security Policy",
        description: "The CSP uses a wildcard (*) which allows resources to be loaded from any source.",
        impact: "Defeats the purpose of CSP by allowing content from any origin, including attacker-controlled domains.",
        recommendation: "Replace * with specific trusted domains your application needs.",
        references: ["https://content-security-policy.com/"],
        found: true,
        value: data.cspValue,
      });
    }
  }

  // --- Clickjacking ---
  vulns.push({
    id: "clickjacking",
    title: "Clickjacking Protection Missing",
    severity: "medium",
    category: "Clickjacking",
    description: "Neither X-Frame-Options nor CSP frame-ancestors directive is set to prevent the page from being embedded in iframes.",
    impact: "Attackers can embed your page in a transparent iframe on their site to trick users into clicking on your UI elements unknowingly.",
    recommendation: "Add X-Frame-Options: DENY or SAMEORIGIN, or use CSP with 'frame-ancestors 'none''.",
    references: ["https://owasp.org/www-community/attacks/Clickjacking"],
    found: !data.clickjackingProtection,
  });

  // --- Cookie Security ---
  for (const cookie of data.cookies || []) {
    if (!cookie.hasSecure && data.isHttps) {
      vulns.push({
        id: `cookie-secure-${cookie.name}`,
        title: `Cookie Missing 'Secure' Flag: ${cookie.name}`,
        severity: "medium",
        category: "Cookie Security",
        description: `The cookie '${cookie.name}' does not have the Secure flag set.`,
        impact: "The cookie can be transmitted over unencrypted HTTP connections, potentially exposing session data.",
        recommendation: `Set the Secure flag: Set-Cookie: ${cookie.name}=value; Secure; HttpOnly; SameSite=Strict`,
        references: ["https://owasp.org/www-community/controls/SecureCookieAttribute"],
        found: true,
        value: cookie.name,
      });
    }
    if (!cookie.hasHttpOnly) {
      vulns.push({
        id: `cookie-httponly-${cookie.name}`,
        title: `Cookie Missing 'HttpOnly' Flag: ${cookie.name}`,
        severity: "medium",
        category: "Cookie Security",
        description: `The cookie '${cookie.name}' does not have the HttpOnly flag set.`,
        impact: "JavaScript can access this cookie, making it vulnerable to theft via XSS attacks.",
        recommendation: `Set the HttpOnly flag: Set-Cookie: ${cookie.name}=value; HttpOnly; Secure; SameSite=Strict`,
        references: ["https://owasp.org/www-community/HttpOnly"],
        found: true,
        value: cookie.name,
      });
    }
    if (!cookie.hasSameSite) {
      vulns.push({
        id: `cookie-samesite-${cookie.name}`,
        title: `Cookie Missing 'SameSite' Attribute: ${cookie.name}`,
        severity: "low",
        category: "Cookie Security",
        description: `The cookie '${cookie.name}' does not have the SameSite attribute.`,
        impact: "Without SameSite, the cookie may be sent with cross-site requests, potentially enabling CSRF attacks.",
        recommendation: "Set SameSite=Strict or SameSite=Lax depending on your application's cross-site usage needs.",
        references: ["https://owasp.org/www-community/SameSite"],
        found: true,
        value: cookie.name,
      });
    }
  }

  // --- Server Information Exposure ---
  if (data.serverInfoExposed && data.serverHeader) {
    vulns.push({
      id: "server-info-exposure",
      title: "Server Software Version Disclosed",
      severity: "low",
      category: "Information Disclosure",
      description: `The Server header reveals detailed software information: "${data.serverHeader}"`,
      impact: "Attackers can identify the exact server software and version, helping them find known CVEs and exploits.",
      recommendation: "Configure your web server to hide version information. In Nginx: 'server_tokens off;' In Apache: 'ServerTokens Prod; ServerSignature Off;'",
      references: ["https://owasp.org/www-project-web-security-testing-guide/"],
      found: true,
      value: data.serverHeader,
    });
  }

  // --- X-Powered-By Header ---
  if (data.poweredByHeader) {
    vulns.push({
      id: "powered-by-disclosure",
      title: "X-Powered-By Header Reveals Technology Stack",
      severity: "low",
      category: "Information Disclosure",
      description: `The X-Powered-By header exposes the backend technology: "${data.poweredByHeader}"`,
      impact: "Reveals the backend framework/language, helping attackers target known vulnerabilities for that technology.",
      recommendation: "Remove or suppress the X-Powered-By header. In Express.js: app.disable('x-powered-by') In PHP: expose_php = Off",
      references: ["https://owasp.org/www-project-web-security-testing-guide/"],
      found: true,
      value: data.poweredByHeader,
    });
  }

  // --- Email Exposure ---
  if ((data.emailsFound?.length || 0) > 0) {
    vulns.push({
      id: "email-exposure",
      title: "Email Addresses Exposed in Source",
      severity: "low",
      category: "Information Disclosure",
      description: `${data.emailsFound?.length} email address(es) found in the page source.`,
      impact: "Exposed email addresses can be harvested by spammers and used for phishing attacks targeting your organization.",
      recommendation: "Use contact forms instead of mailto links. If emails must be displayed, use JavaScript obfuscation or CSS content tricks.",
      references: ["https://owasp.org/www-project-web-security-testing-guide/"],
      found: true,
      value: data.emailsFound?.join(", "),
    });
  }

  // --- Robots.txt Sensitive Paths ---
  if (data.robotsTxt?.exposesSensitivePaths) {
    vulns.push({
      id: "robots-sensitive",
      title: "Robots.txt Reveals Sensitive Paths",
      severity: "info",
      category: "Information Disclosure",
      description: "The robots.txt file contains Disallow entries that reveal sensitive application paths.",
      impact: "While robots.txt is meant to prevent indexing, malicious actors use it as a map to find admin panels and sensitive areas.",
      recommendation: "Avoid listing specific sensitive paths in robots.txt. Use Disallow: / or protect sensitive paths via authentication rather than obscurity.",
      references: ["https://owasp.org/www-project-web-security-testing-guide/"],
      found: true,
      value: data.robotsTxt?.sensitivePaths?.join(", "),
    });
  }

  // --- HSTS Missing ---
  if (!data.hasHSTS && data.isHttps) {
    vulns.push({
      id: "missing-hsts",
      title: "HTTP Strict Transport Security (HSTS) Not Configured",
      severity: "medium",
      category: "Transport Security",
      description: "The site uses HTTPS but does not set the HSTS header.",
      impact: "Without HSTS, browsers may access the site over HTTP before being redirected, exposing the first request to interception.",
      recommendation: "Add: Strict-Transport-Security: max-age=31536000; includeSubDomains; preload",
      references: ["https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Strict_Transport_Security_Cheat_Sheet.html"],
      found: true,
    });
  }

  // Filter to only actual findings
  return vulns.filter((v) => v.found);
}

// ============================================================
// MAIN SCANNER FUNCTION
// ============================================================

/**
 * Main entry point for the security scanner.
 * Performs all security checks against the provided URL.
 */
export async function scanWebsite(inputUrl: string): Promise<ScanResult> {
  const startTime = Date.now();

  // Normalize URL
  let url = inputUrl.trim();
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }

  const originalUrl = url;
  const hostname = new URL(url).hostname;

  // ---- STEP 1: Fetch the main page ----
  const mainFetch = await safeFetch(url);

  if (!mainFetch) {
    throw new Error(`Unable to reach ${url}. The site may be down or blocking automated requests.`);
  }

  const { response, body } = mainFetch;
  const headers = response.headers;
  const finalUrl = response.url || url;
  const statusCode = response.status;
  const isHttps = finalUrl.startsWith("https://");

  // ---- STEP 2: Check HTTP → HTTPS redirect ----
  let httpRedirectsToHttps = false;
  if (isHttps) {
    const httpUrl = url.replace("https://", "http://");
    const httpFetch = await safeFetch(httpUrl);
    if (httpFetch) {
      httpRedirectsToHttps = httpFetch.response.url.startsWith("https://");
    }
  }

  // ---- STEP 3: Parse security headers ----
  const securityHeaders: HeaderCheck[] = REQUIRED_SECURITY_HEADERS.map((h) => ({
    name: h.name,
    present: headers.has(h.name),
    value: headers.get(h.name) || undefined,
    severity: h.severity,
    recommendation: h.recommendation,
  }));

  // Extract specific important headers
  const serverHeader = headers.get("server") || undefined;
  const poweredByHeader = headers.get("x-powered-by") || undefined;
  const hasHSTS = headers.has("strict-transport-security");
  const hstsValue = headers.get("strict-transport-security") || undefined;
  const hasCSP = headers.has("content-security-policy");
  const cspValue = headers.get("content-security-policy") || undefined;
  const hasXFrameOptions = headers.has("x-frame-options");
  const xFrameOptionsValue = headers.get("x-frame-options") || undefined;
  const hasXContentTypeOptions = headers.has("x-content-type-options");
  const hasReferrerPolicy = headers.has("referrer-policy");

  // Detect clickjacking protection (either X-Frame-Options or CSP frame-ancestors)
  const clickjackingProtection =
    hasXFrameOptions ||
    (hasCSP && (cspValue?.includes("frame-ancestors") || false));

  // Detect server info exposure (version number in server header)
  const serverInfoExposed = serverHeader
    ? /\d+\.\d+/.test(serverHeader)
    : false;

  // ---- STEP 4: Parse cookies ----
  const rawCookies: string[] = [];
  headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") {
      rawCookies.push(value);
    }
  });
  // Note: fetch API may combine set-cookie; split on common patterns
  const cookieStrings = rawCookies.flatMap((c) =>
    c.includes(",") ? c.split(/,(?=[^\s].*?=)/) : [c]
  );
  const cookies = cookieStrings.map(parseCookie);

// ---- STEP 5: SSL info ----
  const ssl = {
    present: isHttps,
    protocol: isHttps ? "TLS" : undefined,
    error: !isHttps ? "Site not served over HTTPS" : undefined,
  };

  // ---- STEP 6: Technology detection ----
  const technologies = detectTechnologies(headers, body);

  // ---- STEP 7: Email extraction ----
  const emailsFound = extractEmails(body);

  // ---- STEP 8: Robots.txt analysis ----
  const robotsUrl = `${new URL(finalUrl).origin}/robots.txt`;
  const robotsFetch = await safeFetch(robotsUrl);
  const robotsFound = robotsFetch?.response.status === 200;
  const robotsContent = robotsFound ? robotsFetch?.body || "" : "";
  const robotsAnalysis = robotsContent
    ? analyzeRobotsTxt(robotsContent)
    : { exposesSensitivePaths: false, sensitivePaths: [] };

  const robotsTxt = {
    found: robotsFound,
    content: robotsContent?.slice(0, 2000), // Truncate
    exposesSensitivePaths: robotsAnalysis.exposesSensitivePaths,
    sensitivePaths: robotsAnalysis.sensitivePaths,
  };

  // ---- STEP 9: Sitemap check ----
  const sitemapUrl = `${new URL(finalUrl).origin}/sitemap.xml`;
  const sitemapFetch = await safeFetch(sitemapUrl);
  const sitemap = {
    found: sitemapFetch?.response.status === 200,
    url: sitemapFetch?.response.status === 200 ? sitemapUrl : undefined,
  };

  // ---- STEP 10: Sensitive path probing ----
  const sensitivePaths: ScanResult["sensitivePaths"] = [];
  const origin = new URL(finalUrl).origin;

  // Check a few critical paths (limit to avoid rate limiting)
  const pathsToCheck = ["/.env", "/.git/config", "/phpinfo.php", "/wp-config.php"];
  for (const path of pathsToCheck) {
    const pathFetch = await safeFetch(`${origin}${path}`);
    if (pathFetch) {
      sensitivePaths.push({
        path,
        accessible: pathFetch.response.status === 200,
        statusCode: pathFetch.response.status,
      });
    }
  }

  // Mixed content detection
  const mixedContent = isHttps && /http:\/\/[^"'\s]+\.(js|css|png|jpg|gif)/i.test(body);

  // ---- STEP 11: Compile partial result for scoring ----
  const partialResult: Partial<ScanResult> = {
    isHttps,
    httpRedirectsToHttps,
    securityHeaders,
    ssl,
    cookies,
    hasCSP,
    cspValue,
    hasXFrameOptions,
    xFrameOptionsValue,
    hasHSTS,
    hstsValue,
    hasXContentTypeOptions,
    hasReferrerPolicy,
    clickjackingProtection,
    serverInfoExposed,
    serverHeader,
    poweredByHeader,
    emailsFound,
    robotsTxt,
    mixedContent,
    technologies,
  };

  // ---- STEP 12: Calculate scores ----
  const { overallScore, riskLevel, grade, categoryScores } = calculateScore(partialResult);

  // ---- STEP 13: Compile vulnerabilities ----
  const vulnerabilities = compileVulnerabilities(partialResult);

  // ---- STEP 14: Build summary ----
  const summary = {
    totalVulnerabilities: vulnerabilities.length,
    critical: vulnerabilities.filter((v) => v.severity === "critical").length,
    high: vulnerabilities.filter((v) => v.severity === "high").length,
    medium: vulnerabilities.filter((v) => v.severity === "medium").length,
    low: vulnerabilities.filter((v) => v.severity === "low").length,
    info: vulnerabilities.filter((v) => v.severity === "info").length,
    passedChecks: securityHeaders.filter((h) => h.present).length + (isHttps ? 2 : 0) + (hasHSTS ? 1 : 0),
    totalChecks: securityHeaders.length + 3,
  };

  const scanDuration = Date.now() - startTime;

  return {
    url: inputUrl,
    scannedAt: new Date().toISOString(),
    scanDuration,
    overallScore,
    riskLevel,
    grade,
    finalUrl,
    statusCode,
    responseTime: scanDuration,
    isHttps,
    httpRedirectsToHttps,
    serverHeader,
    poweredByHeader,
    securityHeaders,
    ssl,
    cookies,
    hasCSP,
    cspValue,
    hasXFrameOptions,
    xFrameOptionsValue,
    hasHSTS,
    hstsValue,
    hasXContentTypeOptions,
    hasReferrerPolicy,
    robotsTxt,
    sitemap,
    openRedirect: false,
    serverInfoExposed,
    clickjackingProtection,
    mixedContent,
    technologies,
    emailsFound,
    sensitivePaths,
    vulnerabilities,
    summary,
    categoryScores,
  };
}
