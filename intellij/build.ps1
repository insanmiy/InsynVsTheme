[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

$projectRoot = $PSScriptRoot
$resourceRoot = Join-Path $projectRoot 'src\main\resources'
$pluginXml = Join-Path $resourceRoot 'META-INF\plugin.xml'
$buildRoot = Join-Path $projectRoot 'build'
$stagingRoot = Join-Path $buildRoot 'staging'
$pluginRoot = Join-Path $stagingRoot 'InsynVsTheme'
$libRoot = Join-Path $pluginRoot 'lib'
$distributionRoot = Join-Path $buildRoot 'distributions'

if (-not (Test-Path -LiteralPath $pluginXml)) {
    throw "Plugin descriptor not found: $pluginXml"
}

[xml]$descriptor = Get-Content -Raw -LiteralPath $pluginXml
$version = $descriptor.'idea-plugin'.version
if ([string]::IsNullOrWhiteSpace($version)) {
    throw 'The plugin version is missing from META-INF/plugin.xml.'
}

Get-ChildItem -LiteralPath (Join-Path $resourceRoot 'themes') -Filter '*.theme.json' | ForEach-Object {
    Get-Content -Raw -LiteralPath $_.FullName | ConvertFrom-Json | Out-Null
}

Get-ChildItem -LiteralPath (Join-Path $resourceRoot 'themes') -Filter '*.xml' | ForEach-Object {
    [xml](Get-Content -Raw -LiteralPath $_.FullName) | Out-Null
}

$jarCommand = Get-Command jar -ErrorAction SilentlyContinue
if ($null -eq $jarCommand) {
    throw 'The JDK jar tool is required. Install JDK 17 or newer and add its bin directory to PATH.'
}

if (Test-Path -LiteralPath $stagingRoot) {
    Remove-Item -LiteralPath $stagingRoot -Recurse -Force
}

New-Item -ItemType Directory -Path $libRoot -Force | Out-Null
New-Item -ItemType Directory -Path $distributionRoot -Force | Out-Null

$jarPath = Join-Path $libRoot 'InsynVsTheme.jar'
& $jarCommand.Source --create --file $jarPath -C $resourceRoot .
if ($LASTEXITCODE -ne 0) {
    throw "jar failed with exit code $LASTEXITCODE."
}

$outputPath = Join-Path $distributionRoot "InsynVsTheme-intellij-$version.zip"
if (Test-Path -LiteralPath $outputPath) {
    Remove-Item -LiteralPath $outputPath -Force
}

& $jarCommand.Source --create --no-manifest --file $outputPath -C $stagingRoot 'InsynVsTheme'
if ($LASTEXITCODE -ne 0) {
    throw "jar failed to create the plugin ZIP with exit code $LASTEXITCODE."
}

Add-Type -AssemblyName System.IO.Compression.FileSystem
$archive = [System.IO.Compression.ZipFile]::OpenRead($outputPath)
try {
    $expectedEntry = 'InsynVsTheme/lib/InsynVsTheme.jar'
    $entryNames = @($archive.Entries | ForEach-Object { $_.FullName })
    if ($expectedEntry -notin $entryNames) {
        throw "The plugin ZIP does not contain the expected entry: $expectedEntry"
    }
    if ($entryNames | Where-Object { $_ -match '\\' }) {
        throw 'The plugin ZIP contains non-portable backslash path separators.'
    }
}
finally {
    $archive.Dispose()
}

Write-Host "Built IntelliJ plugin: $outputPath"
