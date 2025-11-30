# 🤖 Auto-Commit & Push System

**Automatically commits and pushes your work every 45 minutes**

## 🚀 Quick Start

### Windows (PowerShell)
```powershell
npm run auto-commit:win
```

### Mac/Linux (Node.js)
```bash
npm run auto-commit
```

## 📋 How It Works

The auto-commit script:
1. **Checks for changes** every 45 minutes
2. **Stages all changes** automatically
3. **Creates a commit** with a descriptive message listing changed files
4. **Pushes to GitHub** automatically

## ⚙️ Configuration

### Change the Interval

Edit `scripts/auto-commit-push.js` or `scripts/auto-commit-push.ps1`:

```javascript
const INTERVAL_MS = 45 * 60 * 1000; // Change 45 to your desired minutes
```

### Run in Background

**Windows:**
```powershell
Start-Process powershell -ArgumentList "-File", "scripts\auto-commit-push.ps1" -WindowStyle Hidden
```

**Mac/Linux:**
```bash
nohup npm run auto-commit > auto-commit.log 2>&1 &
```

## 🛑 Stop Auto-Commit

Press `Ctrl+C` in the terminal where it's running, or:

**Windows:**
```powershell
Get-Process | Where-Object {$_.ProcessName -eq "node" -or $_.ProcessName -eq "powershell"} | Stop-Process
```

**Mac/Linux:**
```bash
pkill -f auto-commit-push
```

## 📝 Commit Messages

Auto-commits use this format:
```
Auto-commit: X files changed

Files:
- src/components/NewComponent.js
- src/screens/NewScreen.js
... and Y more

Timestamp: 2025-01-02T12:34:56.789Z
Auto-committed by auto-commit-push script
```

## ⚠️ Important Notes

1. **Always review commits** before pushing (but this script does it automatically)
2. **Don't commit sensitive data** - the script stages ALL changes
3. **Works best with feature branches** - consider using feature branches
4. **Check `.gitignore`** - make sure sensitive files are excluded

## 🔧 Troubleshooting

### Script won't start
- Check Node.js is installed: `node --version`
- Check PowerShell execution policy: `Get-ExecutionPolicy` (should be RemoteSigned or Unrestricted)

### Commits failing
- Check git credentials are configured
- Verify remote URL: `git remote -v`
- Check branch permissions

### Too many commits
- Increase the interval time
- Use feature branches and merge manually

## 📊 Usage Tips

1. **Start at beginning of session**: Run `npm run auto-commit:win` when you start coding
2. **Let it run in background**: Minimize the terminal and keep coding
3. **Review periodically**: Check GitHub to see your commits
4. **Manual commits still work**: You can commit manually anytime

---

**Status:** ✅ Ready to use!

**Next time you code:** Just run `npm run auto-commit:win` and let it handle the rest! 🎉

