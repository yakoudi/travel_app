# Script pour corriger l'encodage des fichiers
$files = @(
    "frontend/travelbook/src/pages/BookingPage.jsx",
    "frontend/travelbook/src/pages/HotelDetailPage.jsx"
)

$replacements = @{
    'R├®server' = 'Réserver'
    'h├┤tel' = 'hôtel'
    '├®l├®ment' = 'élément'
    '├®toiles' = 'étoiles'
    'd├®but' = 'début'
    'sp├®ciales' = 'spéciales'
    'H├┤tel' = 'Hôtel'
    '├á' = 'à'
    'arriv├®e' = 'arrivée'
    'd├®part' = 'départ'
    '├ëquipements' = 'Équipements'
    'imm├®diate' = 'immédiate'
    '├Ç' = 'À'
    'Ô£ô' = '✓'
    'En-t├¬te' = 'En-tête'
}

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw -Encoding UTF8
        foreach ($key in $replacements.Keys) {
            $content = $content -replace [regex]::Escape($key), $replacements[$key]
        }
        $content | Out-File $file -Encoding UTF8 -NoNewline
        Write-Host "Fichier corrigé: $file"
    }
}
