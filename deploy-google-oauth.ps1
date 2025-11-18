# Quick Deployment Script for Google OAuth

Write-Host "🚀 Deploying Google OAuth to Website..." -ForegroundColor Cyan
Write-Host ""

# Check if in correct directory
if (-not (Test-Path "frontend") -or -not (Test-Path "backend")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Correct directory detected" -ForegroundColor Green
Write-Host ""

# Build frontend
Write-Host "📦 Building frontend..." -ForegroundColor Yellow
Set-Location frontend
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Frontend built successfully" -ForegroundColor Green
Set-Location ..
Write-Host ""

# Instructions
Write-Host "📋 NEXT STEPS TO ENABLE GOOGLE LOGIN ON YOUR WEBSITE:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1️⃣  DEPLOY TO VERCEL:" -ForegroundColor Yellow
Write-Host "   cd frontend"
Write-Host "   vercel --prod"
Write-Host ""

Write-Host "2️⃣  ADD ENVIRONMENT VARIABLE IN VERCEL:" -ForegroundColor Yellow
Write-Host "   → Go to: https://vercel.com/dashboard" -ForegroundColor Cyan
Write-Host "   → Select your project"
Write-Host "   → Settings → Environment Variables"
Write-Host "   → Add variable:"
Write-Host "     Name:  VITE_GOOGLE_CLIENT_ID" -ForegroundColor White
Write-Host "     Value: 348001841881-5qq1b1aq6oup5uhpc9l2h50qn4kskdnh.apps.googleusercontent.com" -ForegroundColor White
Write-Host "   → Check: Production, Preview, Development"
Write-Host "   → Save & Redeploy"
Write-Host ""

Write-Host "3️⃣  UPDATE GOOGLE CLOUD CONSOLE:" -ForegroundColor Yellow
Write-Host "   → Go to: https://console.cloud.google.com/apis/credentials" -ForegroundColor Cyan
Write-Host "   → Edit OAuth 2.0 Client ID"
Write-Host "   → Add your Vercel URL to:"
Write-Host "     • Authorized JavaScript origins"
Write-Host "     • Authorized redirect URIs"
Write-Host "   → Save (wait 5-10 minutes)"
Write-Host ""

Write-Host "4️⃣  UPDATE BACKEND (RENDER):" -ForegroundColor Yellow
Write-Host "   → Go to: https://dashboard.render.com" -ForegroundColor Cyan
Write-Host "   → Select backend service"
Write-Host "   → Environment tab"
Write-Host "   → Add/Verify:"
Write-Host "     GOOGLE_CLIENT_ID=348001841881-5qq1b1aq6oup5uhpc9l2h50qn4kskdnh.apps.googleusercontent.com" -ForegroundColor White
Write-Host "     ALLOWED_ORIGINS=https://your-vercel-url.vercel.app" -ForegroundColor White
Write-Host ""

Write-Host "✨ Your Google Client ID is:" -ForegroundColor Green
Write-Host "348001841881-5qq1b1aq6oup5uhpc9l2h50qn4kskdnh.apps.googleusercontent.com" -ForegroundColor White
Write-Host ""

Write-Host "📖 For detailed instructions, see: GOOGLE_OAUTH_DEPLOYMENT.md" -ForegroundColor Cyan
Write-Host ""

# Ask if user wants to open Vercel
$openVercel = Read-Host "Do you want to open Vercel Dashboard now? (y/n)"
if ($openVercel -eq "y" -or $openVercel -eq "Y") {
    Start-Process "https://vercel.com/dashboard"
}

# Ask if user wants to open Google Console
$openGoogle = Read-Host "Do you want to open Google Cloud Console now? (y/n)"
if ($openGoogle -eq "y" -or $openGoogle -eq "Y") {
    Start-Process "https://console.cloud.google.com/apis/credentials"
}

Write-Host ""
Write-Host "🎉 Setup complete! Follow the steps above to enable Google login on your website." -ForegroundColor Green
