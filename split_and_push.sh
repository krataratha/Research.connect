#!/bin/bash
# 🤖 Research-Connect — Split & Push Automation Script

# Exit immediately if any command fails
set -e

NEW_REMOTE="https://github.com/CodewithsushilOfficial/Research.connect.git"

echo "=========================================================="
echo "🔗 1. UPDATING GIT REMOTE TO THE NEW REPOSITORY..."
echo "=========================================================="
echo "Setting origin remote to: $NEW_REMOTE"
git remote set-url origin "$NEW_REMOTE" || git remote add origin "$NEW_REMOTE"
git fetch origin

# Find local commits
BUG_FIX_COMMIT="192e89f"
SECURITY_COMMIT="4bb15bf"

echo ""
echo "=========================================================="
echo "🔨 2. CREATING SEPARATE BRANCH FOR BUG FIXES..."
echo "=========================================================="
# Switch to a clean bug-fix branch off origin/main
if git show-ref --quiet refs/heads/fix/backend-bugs; then
  git branch -D fix/backend-bugs
fi
git checkout -b fix/backend-bugs origin/main

echo "Cherry-picking bug fixes commit ($BUG_FIX_COMMIT)..."
git cherry-pick "$BUG_FIX_COMMIT"

echo "Pushing 'fix/backend-bugs' to the new repository..."
git push -f origin fix/backend-bugs

echo ""
echo "=========================================================="
echo "🛡️ 3. CREATING SEPARATE BRANCH FOR SECURITY HARDENING..."
echo "=========================================================="
# Switch to a clean security-hardening branch off the bug-fix branch
if git show-ref --quiet refs/heads/feat/security-hardening; then
  git branch -D feat/security-hardening
fi
git checkout -b feat/security-hardening fix/backend-bugs

echo "Pushing 'feat/security-hardening' to the new repository..."
git push -f origin feat/security-hardening

# Switch back to the security branch locally so files are active
git checkout feat/security-hardening

echo ""
echo "=========================================================="
echo "🎉 SUCCESS! BOTH BRANCHES PUSHED TO THE DOTTED REPO."
echo "=========================================================="
echo "Please open your browser and create the two Pull Requests:"
echo ""
echo "👉 PR 1 (Bug Fixes):"
echo "   https://github.com/CodewithsushilOfficial/Research.connect/pull/new/fix/backend-bugs"
echo ""
echo "👉 PR 2 (Security Hardening):"
echo "   https://github.com/CodewithsushilOfficial/Research.connect/pull/new/feat/security-hardening"
echo "=========================================================="
