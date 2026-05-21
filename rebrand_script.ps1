$ErrorActionPreference = "Continue"

$excludeDirs = @("node_modules", ".git", "design-temp", "dist", "bundle")
$excludeFiles = @("Design-Onyx-UI-Concept.zip", "rebrand_script.ps1")
$binaryExtensions = @(".exe", ".dll", ".png", ".jpg", ".jpeg", ".gif", ".zip", ".pdf", ".bin", ".db", ".shm", ".wal", ".ico", ".docx", ".xlsx", ".pptx")

$replaces = @(
    @{ Old = "GEMINI"; New = "ONYX" },
    @{ Old = "Gemini"; New = "Onyx" },
    @{ Old = "gemini"; New = "onyx" }
)

function IsBinary($file) {
    if ($binaryExtensions -contains $file.Extension.ToLower()) {
        return $true
    }
    return $false
}

# 1. Content Replacement
Write-Host "Replacing content..."
$files = Get-ChildItem -Path . -Recurse -File | Where-Object {
    $path = $_.FullName
    $skip = $false
    foreach ($dir in $excludeDirs) {
        if ($path -like "*\$dir\*") { $skip = $true; break }
    }
    if ($excludeFiles -contains $_.Name) { $skip = $true }
    if ($skip) { return $false }
    return -not (IsBinary $_)
}

foreach ($file in $files) {
    try {
        if (-not (Test-Path $file.FullName)) { continue }
        
        $content = [System.IO.File]::ReadAllText($file.FullName)
        $changed = $false
        foreach ($pair in $replaces) {
            if ($content.Contains($pair.Old)) {
                $content = $content.Replace($pair.Old, $pair.New)
                $changed = $true
            }
        }
        if ($changed) {
            [System.IO.File]::WriteAllText($file.FullName, $content)
            Write-Host "Updated content: $($file.FullName)"
        }
    } catch {
        Write-Warning "Could not process $($file.FullName): $($_.Exception.Message)"
    }
}

# 2. Renaming
Write-Host "Renaming files and directories..."
$itemsToRename = Get-ChildItem -Path . -Recurse | Where-Object {
    $path = $_.FullName
    $skip = $false
    foreach ($dir in $excludeDirs) {
        if ($path -like "*\$dir\*") { $skip = $true; break }
    }
    if ($excludeFiles -contains $_.Name) { $skip = $true }
    if ($skip) { return $false }
    return $_.Name.ToLower().Contains("gemini")
} | Sort-Object FullName -Descending

foreach ($item in $itemsToRename) {
    $newName = $item.Name
    foreach ($pair in $replaces) {
        $newName = $newName.Replace($pair.Old, $pair.New)
    }
    
    if ($newName -ne $item.Name) {
        $newPath = Join-Path $item.Parent.FullName $newName
        if (Test-Path $newPath) {
            Write-Warning "Target path already exists, skipping rename: $newPath"
        } else {
            Write-Host "Renaming: $($item.FullName) -> $newPath"
            Move-Item $item.FullName $newPath -Force
        }
    }
}
