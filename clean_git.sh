#!/bin/bash
# 🤖 Research-Connect — Git Clean & Secrets Removal Script

# Exit immediately if any command fails
set -e

NEW_REMOTE="https://github.com/CodewithsushilOfficial/Research.connect.git"

echo "=========================================================="
echo "🧹 1. CLEARING CONFLCTS AND UPDATING REMOTE..."
echo "=========================================================="
git cherry-pick --abort || true
git remote set-url origin "$NEW_REMOTE" || git remote add origin "$NEW_REMOTE"
git fetch origin

echo ""
echo "=========================================================="
echo "🛡️ 2. STOPPING TRACKING OF .ENV AND UPDATING GITIGNORE..."
echo "=========================================================="
# Remove .env from git tracking (keeps the physical file on your disk!)
git rm --cached Backend/.env || true

# Add .env to the root .gitignore if not already there
if ! grep -q "Backend/\.env" .gitignore; then
  echo "" >> .gitignore
  echo "# Environment secrets" >> .gitignore
  echo "Backend/.env" >> .gitignore
  echo ".env" >> .gitignore
  echo "secrets.env" >> .gitignore
  echo "git tracking stopped and .gitignore updated."
fi

echo ""
echo "=========================================================="
echo "🔨 3. RECREATING CLEAN BUG FIXES BRANCH..."
echo "=========================================================="
# Switch to a new branch directly off the new origin/main
if git show-ref --quiet refs/heads/fix/backend-bugs; then
  git branch -D fix/backend-bugs
fi
git checkout -b fix/backend-bugs origin/main

# Checkout the bug-fix files from the local branch
git checkout fix/backend-security-and-bugs -- \
  Backend/package.json \
  Backend/src/app.js \
  Backend/src/controllers/auth.controller.js \
  Backend/src/controllers/publication.controller.js \
  Backend/src/middleware/errorHandler.js \
  Backend/src/middleware/security.middleware.js \
  Backend/src/models/Research.js \
  Backend/src/models/SavedResearch.js \
  Backend/src/models/TrustedDevice.js \
  Backend/src/routes/publication.routes.js \
  Backend/src/tests/auth-persistence.test.js

# Ensure .env is NOT staged
git reset HEAD Backend/.env || true

# Commit the clean bug fixes
git commit -m "fix(backend-bugs): resolve crashes, route ordering, and compatibility issues"

# Push to origin
git push -f origin fix/backend-bugs

echo ""
echo "=========================================================="
echo "🛡️ 4. RECREATING CLEAN SECURITY HARDENING BRANCH..."
echo "=========================================================="
# Switch to a new branch directly off our new clean bug-fixes branch
if git show-ref --quiet refs/heads/feat/security-hardening; then
  git branch -D feat/security-hardening
fi
git checkout -b feat/security-hardening fix/backend-bugs

# Checkout the security-hardening files from the local branch
git checkout security/cyber-hardening -- \
  Backend/SECURITY_REPORT.md \
  Backend/src/middleware/security/ \
  Backend/src/middleware/auth.middleware.js \
  Backend/src/routes/upload.routes.js \
  Backend/src/server.js \
  Backend/src/tests/security-verification.test.js

# Ensure .env is NOT staged
git reset HEAD Backend/.env || true

# Commit the clean security hardening
git commit -m "feat(security-hardening): implement production-grade cybersecurity middleware"

# Push to origin
git push -f origin feat/security-hardening

echo ""
echo "=========================================================="
echo "🎉 SUCCESS! CLEAN BRANCHES PUSHED WITHOUT SECRETS."
echo "=========================================================="
echo "Please open your browser to create the two Pull Requests:"
echo ""
echo "👉 PR 1 (Bug Fixes):"
echo "   https://github.com/CodewithsushilOfficial/Research.connect/pull/new/fix/backend-bugs"
echo ""
echo "👉 PR 2 (Security Hardening):"
echo "   https://github.com/CodewithsushilOfficial/Research.connect/pull/new/feat/security-hardening"
echo "=========================================================="
