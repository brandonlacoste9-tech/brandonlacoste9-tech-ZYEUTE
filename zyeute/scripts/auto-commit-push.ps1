# Auto Commit & Push Script (PowerShell)
# Automatically commits and pushes changes every 45 minutes
# 
# Usage: .\scripts\auto-commit-push.ps1
# Or run in background: Start-Process powershell -ArgumentList "-File", "scripts\auto-commit-push.ps1" -WindowStyle Hidden

$INTERVAL_MINUTES = 45
$GIT_DIR = $PSScriptRoot + "\.."
$LAST_COMMIT_FILE = Join-Path $GIT_DIR ".git\last-auto-commit"

function Get-CurrentTime {
    return Get-Date -Format "yyyy-MM-dd HH:mm:ss"
}

function Get-LastCommitTime {
    if (Test-Path $LAST_COMMIT_FILE) {
        $content = Get-Content $LAST_COMMIT_FILE -Raw
        return [DateTime]::Parse($content.Trim())
    }
    return $null
}

function Set-LastCommitTime {
    Get-CurrentTime | Out-File -FilePath $LAST_COMMIT_FILE -Encoding utf8
}

function Test-HasChanges {
    Push-Location $GIT_DIR
    try {
        $status = git status --porcelain
        Pop-Location
        return $status.Trim().Length -gt 0
    }
    catch {
        Pop-Location
        return $false
    }
}

function Invoke-AutoCommit {
    try {
        Write-Host "[$(Get-CurrentTime)] 🔄 Checking for changes..." -ForegroundColor Cyan
        
        if (-not (Test-HasChanges)) {
            Write-Host "   ✅ No changes to commit" -ForegroundColor Green
            return
        }

        # Stage all changes
        Write-Host "   📦 Staging changes..." -ForegroundColor Yellow
        Push-Location $GIT_DIR
        git add -A

        # Get list of changed files
        $changedFiles = (git diff --cached --name-only) -split "`n" | Where-Object { $_.Trim() -ne "" }

        # Create commit message
        $timestamp = Get-CurrentTime
        $fileList = $changedFiles[0..19] -join "`n- "
        $moreFiles = if ($changedFiles.Count -gt 20) { "`n... and $($changedFiles.Count - 20) more" } else { "" }
        
        $commitMessage = @"
Auto-commit: $($changedFiles.Count) files changed

Files:
- $fileList$moreFiles

Timestamp: $timestamp
Auto-committed by auto-commit-push script
"@

        # Commit
        Write-Host "   💾 Committing changes..." -ForegroundColor Yellow
        git commit -m $commitMessage

        # Push
        Write-Host "   🚀 Pushing to GitHub..." -ForegroundColor Yellow
        git push origin HEAD

        Pop-Location
        Set-LastCommitTime
        Write-Host "   ✅ Successfully committed and pushed $($changedFiles.Count) files" -ForegroundColor Green
        
    }
    catch {
        Write-Host "   ❌ Error during auto-commit: $_" -ForegroundColor Red
        Pop-Location
    }
}

# Main
Write-Host "🤖 Auto Commit & Push Script Started" -ForegroundColor Cyan
Write-Host "   Interval: $INTERVAL_MINUTES minutes" -ForegroundColor Cyan
Write-Host "   Git Directory: $GIT_DIR" -ForegroundColor Cyan
Write-Host "   Press Ctrl+C to stop`n" -ForegroundColor Cyan

# Run immediately on start
Invoke-AutoCommit

# Then run every 45 minutes
while ($true) {
    Start-Sleep -Seconds ($INTERVAL_MINUTES * 60)
    Invoke-AutoCommit
}

