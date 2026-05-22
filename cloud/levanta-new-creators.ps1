param(
  [ValidateSet('active', 'connections')]
  [string]$Source = 'connections',
  [string]$StateDir = '.\levanta-state',
  [string]$OutputDir = '.\levanta-reports',
  [switch]$TreatFirstRunAsNew
)

$ErrorActionPreference = 'Stop'

$apiKey = $env:LEVANTA_API_KEY
if ([string]::IsNullOrWhiteSpace($apiKey)) {
  throw 'Missing LEVANTA_API_KEY. Set it in your environment before running this script.'
}

$base = 'https://app.levanta.io/api/seller/v1'
$headers = @{ Authorization = "Bearer $apiKey" }
$endpoint = if ($Source -eq 'active') { '/creators/active' } else { '/creator-connections/creators' }
$root = if ($Source -eq 'active') { 'creators' } else { 'creators' }

function Get-AllPages {
  param([string]$Path, [string]$Root)

  $cursor = $null
  $items = @()

  do {
    $query = @{ limit = '100' }
    if ($cursor) {
      $query.cursor = $cursor
    }

    $qs = ($query.GetEnumerator() | ForEach-Object {
      [uri]::EscapeDataString($_.Key) + '=' + [uri]::EscapeDataString([string]$_.Value)
    }) -join '&'

    $response = Invoke-RestMethod -Uri ($base + $Path + '?' + $qs) -Headers $headers -Method Get
    $items += @($response.$Root)
    $cursor = $response.cursor
  } while ($cursor)

  return $items
}

New-Item -ItemType Directory -Path $StateDir -Force | Out-Null
New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null

$today = Get-Date -Format 'yyyy-MM-dd'
$latestPath = Join-Path $StateDir "levanta-$Source-creators-latest.json"
$snapshotPath = Join-Path $StateDir "levanta-$Source-creators-$today.json"
$csvPath = Join-Path $OutputDir "levanta-new-$Source-creators-$today.csv"
$jsonPath = Join-Path $OutputDir "levanta-new-$Source-creators-$today.json"

$current = @(Get-AllPages -Path $endpoint -Root $root | Sort-Object id)

$previous = @()
if (Test-Path $latestPath) {
  $previousJson = Get-Content -LiteralPath $latestPath -Raw
  $previous = @($previousJson | ConvertFrom-Json | ForEach-Object { $_ })
}

$previousIds = @{}
foreach ($creator in $previous) {
  if ($creator.id) {
    $previousIds[$creator.id] = $true
  }
}

$newCreators = @()
if ($previous.Count -gt 0 -or $TreatFirstRunAsNew) {
  $newCreators = @($current | Where-Object { -not $previousIds.ContainsKey($_.id) })
}

$reportRows = @($newCreators | ForEach-Object {
  [PSCustomObject]@{
    date = $today
    source = $Source
    id = $_.id
    name = $_.name
    email = $_.email
    bio = $_.bio
  }
})

$current | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $snapshotPath -Encoding UTF8
$current | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $latestPath -Encoding UTF8
$reportRows | Export-Csv -LiteralPath $csvPath -NoTypeInformation -Encoding UTF8
if ($reportRows.Count -eq 0) {
  '[]' | Set-Content -LiteralPath $jsonPath -Encoding UTF8
} else {
  $reportRows | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $jsonPath -Encoding UTF8
}

[PSCustomObject]@{
  date = $today
  source = $Source
  total_creators = $current.Count
  previous_creators = $previous.Count
  new_creators = $newCreators.Count
  csv = (Resolve-Path $csvPath).Path
  json = (Resolve-Path $jsonPath).Path
  snapshot = (Resolve-Path $snapshotPath).Path
} | ConvertTo-Json -Depth 4
