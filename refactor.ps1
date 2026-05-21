$count = 0
$files = Get-ChildItem -Recurse -Path "packages","tools","scripts" -Include "*.ts","*.tsx","*.js","*.jsx","*.json","*.yml","*.yaml","*.md" -ErrorAction SilentlyContinue | Where-Object {$_.FullName -notlike "*dist*" -and $_.FullName -notlike "*node_modules*" -and $_.FullName -notlike "*bundle*"}

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    if ($null -eq $content) { continue }
    $original = $content
    
    $content = $content -replace 'onyxChat\b', 'onyxChat'
    $content = $content -replace 'OnyxChat\b', 'OnyxChat'
    $content = $content -replace 'OnyxMessage\b', 'OnyxMessage'
    $content = $content -replace 'OnyxSpinner\b', 'OnyxSpinner'
    $content = $content -replace 'OnyxRespondingSpinner\b', 'OnyxRespondingSpinner'
    $content = $content -replace 'useOnyxStream\b', 'useOnyxStream'
    $content = $content -replace 'OnyxPrivacyNotice\b', 'OnyxPrivacyNotice'
    $content = $content -replace 'onyxLiveTranscriptionProvider\b', 'onyxLiveTranscriptionProvider'
    $content = $content -replace 'OnyxLiveTranscriptionProvider\b', 'OnyxLiveTranscriptionProvider'
    $content = $content -replace 'onyxRequest\b', 'onyxRequest'
    $content = $content -replace 'OnyxRequest\b', 'OnyxRequest'
    $content = $content -replace 'onyxSandbox\b', 'onyxSandbox'
    $content = $content -replace 'OnyxSandbox\b', 'OnyxSandbox'
    $content = $content -replace 'onyx\.md\b', 'onyx.md'
    $content = $content -replace 'onyxIgnore\b', 'onyxIgnore'
    $content = $content -replace 'OnyxPrivacy\b', 'OnyxPrivacy'
    $content = $content -replace '\.onyx\b', '.onyx'
    
    if ($content -ne $original) {
        Set-Content $file.FullName -Value $content
        $count++
        Write-Host "Updated: $($file.Name)"
    }
}

Write-Host "Total files updated: $count"
