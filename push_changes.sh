#!/bin/bash
# 🤖 Research-Connect — Git Automation Script

# Exit immediately if any command fails
set -e

echo "=========================================================="
echo "🚀 STAGING AND COMMITTING SECURITY HARDENING CHANGES..."
echo "=========================================================="

# 1. Switch to a new security branch
if git show-ref --quiet refs/heads/security/cyber-hardening; then
  echo "Branch security/cyber-hardening already exists. Switching to it..."
  git checkout security/cyber-hardening
else
  echo "Creating new branch security/cyber-hardening..."
  git checkout -b security/cyber-hardening
fi

# 2. Stage all related changes
git add Backend/package.json \
        Backend/src/app.js \
        Backend/src/controllers/auth.controller.js \
        Backend/src/controllers/publication.controller.js \
        Backend/src/middleware/auth.middleware.js \
        Backend/src/routes/upload.routes.js \
        Backend/src/server.js \
        Backend/SECURITY_REPORT.md \
        Backend/src/middleware/security/ \
        Backend/src/tests/security-verification.test.js

# 3. Commit
git commit -m "feat(security): implement production-grade cybersecurity hardening

- Deep NoSQL Injection sanitizer recursively cleaning nested objects/arrays
- Context-aware XSS sanitizer stripping script tags & event handlers
- Per-route sliding-window rate limiters for auth endpoints
- HTTP Parameter Pollution blocker collapsing duplicate query arrays
- Magic-byte file validation preventing MIME-type spoofing
- Path traversal guard securing downloads
- JWT algorithm pinned to HS256 to prevent alg:none bypass
- Secure logger wrapper redacting passwords/tokens from console logs"

echo ""
echo "=========================================================="
echo "📤 PUSHING BRANCH TO GITHUB..."
echo "=========================================================="
git push -u origin security/cyber-hardening

echo ""
echo "=========================================================="
echo "🎉 SUCCESS! PUSH COMPLETE."
echo "Use the GitHub link printed above to open the Pull Request."
echo "=========================================================="
