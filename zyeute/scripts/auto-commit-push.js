#!/usr/bin/env node
/**
 * Auto Commit & Push Script
 * Automatically commits and pushes changes every 45 minutes
 * 
 * Usage: node scripts/auto-commit-push.js
 * Or run in background: node scripts/auto-commit-push.js &
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const INTERVAL_MS = 45 * 60 * 1000; // 45 minutes
const GIT_DIR = path.resolve(__dirname, '..');
const LAST_COMMIT_FILE = path.join(GIT_DIR, '.git', 'last-auto-commit');

function getCurrentTime() {
  return new Date().toISOString();
}

function getLastCommitTime() {
  try {
    if (fs.existsSync(LAST_COMMIT_FILE)) {
      return new Date(fs.readFileSync(LAST_COMMIT_FILE, 'utf8').trim());
    }
  } catch (e) {
    // Ignore
  }
  return null;
}

function setLastCommitTime() {
  try {
    fs.writeFileSync(LAST_COMMIT_FILE, getCurrentTime());
  } catch (e) {
    console.error('Error saving last commit time:', e);
  }
}

function hasChanges() {
  try {
    const status = execSync('git status --porcelain', { 
      cwd: GIT_DIR, 
      encoding: 'utf8' 
    });
    return status.trim().length > 0;
  } catch (e) {
    return false;
  }
}

function getStagedChanges() {
  try {
    const diff = execSync('git diff --cached --stat', { 
      cwd: GIT_DIR, 
      encoding: 'utf8' 
    });
    return diff.trim();
  } catch (e) {
    return '';
  }
}

function autoCommit() {
  try {
    console.log(`[${getCurrentTime()}] 🔄 Checking for changes...`);
    
    if (!hasChanges()) {
      console.log('   ✅ No changes to commit');
      return;
    }

    // Stage all changes
    console.log('   📦 Staging changes...');
    execSync('git add -A', { cwd: GIT_DIR, stdio: 'inherit' });

    // Get list of changed files for commit message
    const changedFiles = execSync('git diff --cached --name-only', { 
      cwd: GIT_DIR, 
      encoding: 'utf8' 
    }).trim().split('\n').filter(f => f);

    // Create commit message
    const timestamp = getCurrentTime();
    const commitMessage = `Auto-commit: ${changedFiles.length} files changed

Files:
${changedFiles.slice(0, 20).map(f => `- ${f}`).join('\n')}
${changedFiles.length > 20 ? `... and ${changedFiles.length - 20} more` : ''}

Timestamp: ${timestamp}
Auto-committed by auto-commit-push script`;

    // Commit
    console.log('   💾 Committing changes...');
    execSync(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`, { 
      cwd: GIT_DIR, 
      stdio: 'inherit' 
    });

    // Push
    console.log('   🚀 Pushing to GitHub...');
    execSync('git push origin HEAD', { 
      cwd: GIT_DIR, 
      stdio: 'inherit' 
    });

    setLastCommitTime();
    console.log(`   ✅ Successfully committed and pushed ${changedFiles.length} files`);
    
  } catch (error) {
    console.error(`   ❌ Error during auto-commit:`, error.message);
    // Don't throw - continue running
  }
}

// Main loop
console.log('🤖 Auto Commit & Push Script Started');
console.log(`   Interval: ${INTERVAL_MS / 60000} minutes`);
console.log(`   Git Directory: ${GIT_DIR}`);
console.log('   Press Ctrl+C to stop\n');

// Run immediately on start (if there are changes)
autoCommit();

// Then run every 45 minutes
setInterval(() => {
  autoCommit();
}, INTERVAL_MS);

// Keep process alive
process.on('SIGINT', () => {
  console.log('\n👋 Auto-commit script stopped');
  process.exit(0);
});

