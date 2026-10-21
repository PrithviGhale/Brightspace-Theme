$ErrorActionPreference = 'Stop'
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$extensionRoot = Join-Path $projectRoot 'extension'
$manifest = Get-Content -Raw -LiteralPath (Join-Path $extensionRoot 'manifest.json') | ConvertFrom-Json
$outputRoot = Join-Path $projectRoot 'dist'
New-Item -ItemType Directory -Force -Path $outputRoot | Out-Null
$zipPath = Join-Path $outputRoot ("brightspace-after-hours-{0}.zip" -f $manifest.version)
$sources = @((Join-Path $extensionRoot '*'), (Join-Path $projectRoot 'README.md'), (Join-Path $projectRoot 'PAGE_AUDIT.md'))
Compress-Archive -Path $sources -DestinationPath $zipPath -Force
Add-Type -AssemblyName System.IO.Compression.FileSystem
$archive = [IO.Compression.ZipFile]::OpenRead($zipPath)
try {
    $entries = @($archive.Entries | ForEach-Object { $_.FullName })
    if ($entries -notcontains 'manifest.json') { throw 'ZIP must contain manifest.json at its root.' }
    if ($entries.Count -ne 10) { throw "Unexpected package entry count: $($entries.Count)" }
    foreach ($entry in $entries) {
        if ($entry -match '[/\\]' -or $entry -match 'preview|test|storage-adapter') { throw "Unexpected package entry: $entry" }
    }
    Write-Output ("Verified {0} files: {1}" -f $entries.Count, ($entries -join ', '))
} finally { $archive.Dispose() }
Get-Item -LiteralPath $zipPath | Select-Object FullName, Length
Get-FileHash -Algorithm SHA256 -LiteralPath $zipPath
