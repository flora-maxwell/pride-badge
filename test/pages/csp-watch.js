// Collects Content-Security-Policy violations for csp.html (inline scripts aren't allowed there).
window.violations = [];
document.addEventListener('securitypolicyviolation', (e) => window.violations.push(`${e.violatedDirective}: ${e.sample || e.blockedURI}`));
