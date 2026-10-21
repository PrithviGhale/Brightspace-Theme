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
    $entries = @($archive.Entries | Where-Object { $_.Name } | ForEach-Object { $_.FullName.Replace('\','/') })
    if ($entries -notcontains 'manifest.json') { throw 'ZIP must contain manifest.json at its root.' }
    $expected = @('content.js','manifest.json','popup.css','popup.html','popup.js','preferences.js','theme-engine.js','widget-context.js','README.md','PAGE_AUDIT.md','icons/icon-16.png','icons/icon-32.png','icons/icon-48.png','icons/icon-128.png')
    if (@(Compare-Object ($entries | Sort-Object) ($expected | Sort-Object)).Count) { throw 'Package file list differs from the expected extension assets.' }
    foreach ($entry in $entries) {
        if ($entry -match 'preview|test|storage-adapter|\.\.') { throw "Unexpected package entry: $entry" }
    }
    Write-Output ("Verified {0} files: {1}" -f $entries.Count, ($entries -join ', '))
} finally { $archive.Dispose() }
Get-Item -LiteralPath $zipPath | Select-Object FullName, Length
Get-FileHash -Algorithm SHA256 -LiteralPath $zipPath
