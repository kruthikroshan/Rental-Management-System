# Quick Git Push Script
# Automatically commits and pushes all changes to GitHub

param(
    [string]$message = "Update project files"
)

Write-Host "[*] Starting Git workflow..." -ForegroundColor Cyan

# Check if there are changes
Write-Host "`n[*] Checking for changes..." -ForegroundColor Yellow
git status --short

# Add all changes
Write-Host "`n[+] Adding all changes..." -ForegroundColor Yellow
git add .

# Check if there's anything to commit
$status = git status --porcelain
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "`n[OK] No changes to commit!" -ForegroundColor Green
    exit 0
}

# Commit changes
Write-Host "`n[*] Committing changes..." -ForegroundColor Yellow
git commit -m $message

# Push to GitHub
Write-Host "`n[*] Pushing to GitHub..." -ForegroundColor Yellow
git push

Write-Host "`n[OK] Successfully pushed to GitHub!" -ForegroundColor Green
Write-Host "[*] Repository: https://github.com/kruthikroshan/Rental-Management-System" -ForegroundColor Cyan
