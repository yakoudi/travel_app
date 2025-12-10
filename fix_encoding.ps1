# Script pour corriger l'encodage des fichiers
$files = @(
    "frontend/travelbook/src/pages/BookingPage.jsx",
    "frontend/travelbook/src/pages/HotelDetailPage.jsx"
)

$replacements = @{
    'reserver' = 'Réserver'
    'hotel' = 'hôtel'
    'element' = 'élément'
    'etoiles' = 'étoiles'
    'but' = 'début'
    'speciales' = 'spéciales'
    'hotel' = 'Hôtel'
    'á' = 'à'
    'arrivée' = 'arrivée'
    'départ' = 'départ'
       'immédiat' = 'immédiate'
    'Ç' = 'À'
    'Ô' = '✓'
    'En-tête' = 'En-tête'

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
