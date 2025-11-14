# PyroBot Update Script (Windows PowerShell)
# This script safely updates the bot from GitHub while preserving local configuration

Write-Host "🔄 PyroBot Update Script" -ForegroundColor Cyan
Write-Host "=======================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in a git repository
if (-Not (Test-Path .git)) {
    Write-Host "❌ Error: Not a git repository" -ForegroundColor Red
    Write-Host "Please run this script from the PyroBot directory"
    exit 1
}

# Backup .env file if it exists
if (Test-Path .env) {
    Write-Host "📦 Backing up .env file..." -ForegroundColor Blue
    Copy-Item .env .env.backup -Force
    Write-Host "✓ .env backed up to .env.backup" -ForegroundColor Green
} else {
    Write-Host "⚠ No .env file found (this is okay for first run)" -ForegroundColor Yellow
}

# Backup database if it exists
if ((Test-Path data) -and (Test-Path data/pyrobot.db)) {
    Write-Host "📦 Backing up database..." -ForegroundColor Blue
    Copy-Item data/pyrobot.db data/pyrobot.db.backup -Force
    Write-Host "✓ Database backed up to data/pyrobot.db.backup" -ForegroundColor Green
}

# Stash any local changes
Write-Host "📝 Stashing local changes..." -ForegroundColor Blue
$stashDate = Get-Date -Format "yyyy-MM-dd_HH:mm:ss"
git stash push -m "Auto-stash before update $stashDate"

# Fetch latest changes
Write-Host "🌐 Fetching latest changes from GitHub..." -ForegroundColor Blue
git fetch origin

# Get current branch
$currentBranch = git rev-parse --abbrev-ref HEAD
Write-Host "📍 Current branch: $currentBranch" -ForegroundColor Blue

# Pull latest changes
Write-Host "⬇️  Pulling latest changes..." -ForegroundColor Blue
git pull origin $currentBranch

# Restore .env file if it was backed up
if (Test-Path .env.backup) {
    Write-Host "♻️  Restoring .env file..." -ForegroundColor Blue
    Move-Item .env.backup .env -Force
    Write-Host "✓ .env restored" -ForegroundColor Green
}

# Check if .env.example was updated and .env exists
if ((Test-Path .env.example) -and (Test-Path .env)) {
    Write-Host ""
    Write-Host "📋 Checking for new environment variables..." -ForegroundColor Yellow
    
    # Extract variable names from both files
    $envExampleVars = (Get-Content .env.example | Where-Object { $_ -notmatch '^#' -and $_ -match '=' } | ForEach-Object { $_.Split('=')[0] }) | Sort-Object
    $envVars = (Get-Content .env | Where-Object { $_ -notmatch '^#' -and $_ -match '=' } | ForEach-Object { $_.Split('=')[0] }) | Sort-Object
    
    # Find variables in .env.example that are not in .env
    $newVars = Compare-Object $envExampleVars $envVars | Where-Object { $_.SideIndicator -eq '<=' } | Select-Object -ExpandProperty InputObject
    
    if ($newVars) {
        Write-Host "⚠ New environment variables found in .env.example:" -ForegroundColor Yellow
        $newVars | ForEach-Object { Write-Host "   - $_" }
        Write-Host ""
        Write-Host "Please add these to your .env file manually." -ForegroundColor Yellow
    } else {
        Write-Host "✓ No new environment variables" -ForegroundColor Green
    }
}

# Install/update dependencies
Write-Host ""
Write-Host "📦 Installing/updating dependencies..." -ForegroundColor Blue
if (Test-Path package.json) {
    npm install
    Write-Host "✓ Dependencies updated" -ForegroundColor Green
} else {
    Write-Host "⚠ No package.json found" -ForegroundColor Yellow
}

# Show git log of changes
Write-Host ""
Write-Host "📜 Recent changes:" -ForegroundColor Blue
git log --oneline -5

Write-Host ""
Write-Host "✅ Update complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Blue
Write-Host "1. Review changes above"
Write-Host "2. Check .env file for any new required variables"
Write-Host "3. Restart the bot: docker-compose restart (if using Docker)"
Write-Host "   or: npm start (if running directly)"
Write-Host ""
Write-Host "💾 Backups created:" -ForegroundColor Yellow
if (Test-Path .env) { Write-Host "   - .env.backup" }
if (Test-Path data/pyrobot.db.backup) { Write-Host "   - data/pyrobot.db.backup" }
Write-Host ""
