$count = 0
$files = Get-ChildItem -Recurse -Path "packages","tools","scripts" -Include "*.ts","*.tsx","*.js","*.jsx","*.json","*.yml","*.yaml","*.md" -ErrorAction SilentlyContinue | Where-Object {$_.FullName -notlike "*dist*" -and $_.FullName -notlike "*node_modules*" -and $_.FullName -notlike "*bundle*"}

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    if ($null -eq $content) { continue }
    $original = $content
    
    $content = $content -replace 'geminiChat\b', 'onyxChat'
    $content = $content -replace 'GeminiChat\b', 'OnyxChat'
    $content = $content -replace 'GeminiMessage\b', 'OnyxMessage'
    $content = $content -replace 'GeminiSpinner\b', 'OnyxSpinner'
    $content = $content -replace 'GeminiRespondingSpinner\b', 'OnyxRespondingSpinner'
    $content = $content -replace 'useGeminiStream\b', 'useOnyxStream'
    $content = $content -replace 'GeminiPrivacyNotice\b', 'OnyxPrivacyNotice'
    $content = $content -replace 'geminiLiveTranscriptionProvider\b', 'onyxLiveTranscriptionProvider'
    $content = $content -replace 'GeminiLiveTranscriptionProvider\b', 'OnyxLiveTranscriptionProvider'
    $content = $content -replace 'geminiRequest\b', 'onyxRequest'
    $content = $content -replace 'GeminiRequest\b', 'OnyxRequest'
    $content = $content -replace 'geminiSandbox\b', 'onyxSandbox'
    $content = $content -replace 'GeminiSandbox\b', 'OnyxSandbox'
    $content = $content -replace 'gemini\.md\b', 'onyx.md'
    $content = $content -replace 'geminiIgnore\b', 'onyxIgnore'
    $content = $content -replace 'GeminiPrivacy\b', 'OnyxPrivacy'
    $content = $content -replace '\.gemini\b', '.onyx'
    
    if ($content -ne $original) {
        Set-Content $file.FullName -Value $content
        $count++
        Write-Host "Updated: $($file.Name)"
    }
}

Write-Host "Total files updated: $count"
