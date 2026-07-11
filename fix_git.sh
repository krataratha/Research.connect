#!/bin/bash
# 🤖 Research-Connect — Git Fix & Push Script

# Exit immediately if any command fails
set -e

NEW_REMOTE="https://github.com/CodewithsushilOfficial/Research.connect.git"

echo "=========================================================="
echo "🧹 1. ABORTING FAILED CHERRY-PICK..."
echo "=========================================================="
git cherry-pick --abort || true
echo "Git conflict state cleared."

echo ""
echo "=========================================================="
echo "🔗 2. CONFIGURING NEW REMOTE..."
echo "=========================================================="
git remote set-url origin "$NEW_REMOTE" || git remote add origin "$NEW_REMOTE"
git fetch origin

echo ""
echo "=========================================================="
echo "📤 3. PUSHING BUG FIXES BRANCH..."
echo "=========================================================="
# Push the local bug-fixes branch directly to origin as 'fix/backend-bugs'
echo "Pushing 'fix/backend-security-and-bugs' -> 'fix/backend-bugs'..."
git push -f origin fix/backend-security-and-bugs:fix/backend-bugs

echo ""
echo "=========================================================="
echo "📤 4. PUSHING SECURITY HARDENING BRANCH..."
echo "=========================================================="
# Push the local security branch directly to origin as 'feat/security-hardening'
echo "Pushing 'security/cyber-hardening' -> 'feat/security-hardening'..."
git push -f origin security/cyber-hardening:feat/security-hardening

# Switch back to the active security branch locally
git checkout security/cyber-hardening

echo ""
echo "=========================================================="
echo "🎉 SUCCESS! BOTH BRANCHES PUSHED TO THE DOTTED REPO."
echo "=========================================================="
echo "Please open your browser to create the two separate Pull Requests:"
echo ""
echo "👉 PR 1 (Bug Fixes):"
echo "   https://github.com/CodewithsushilOfficial/Research.connect/pull/new/fix/backend-bugs"
echo ""
echo "👉 PR 2 (Security Hardening):"
echo "   https://github.com/CodewithsushilOfficial/Research.connect/pull/new/feat/security-hardening"
echo "=========================================================="
