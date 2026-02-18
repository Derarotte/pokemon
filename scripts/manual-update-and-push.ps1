param(
  [string]$Message = "chore(data): manual update pokemon dataset"
)

$ErrorActionPreference = "Stop"

node scripts/fetch-pokemon-data.mjs

git add data/pokemon.json

# No-op if data did not change.
git diff --cached --quiet
if ($LASTEXITCODE -eq 0) {
  Write-Host "No data changes to commit."
  exit 0
}

git commit -m $Message
git push
Write-Host "Pushed to remote."
