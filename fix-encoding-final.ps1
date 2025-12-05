# Correction automatique de l'encodage
Write-Host "Correction de l'encodage des fichiers..." -ForegroundColor Yellow

# Restaurer les fichiers depuis Git avec le bon encodage
$files = @(
    "frontend/travelbook/src/pages/BookingPage.jsx",
    "frontend/travelbook/src/pages/HotelDetailPage.jsx"
)

foreach ($file in $files) {
    Write-Host "Traitement de $file..." -ForegroundColor Cyan
    
    # Lire le contenu avec l'encodage par défaut
    $bytes = [System.IO.File]::ReadAllBytes($file)
    
    # Détecter et convertir
    $text = [System.Text.Encoding]::Default.GetString($bytes)
    
    # Sauvegarder en UTF-8 sans BOM
    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText($file, $text, $utf8NoBom)
    
    Write-Host "✓ $file corrigé" -ForegroundColor Green
}

Write-Host "`nTerminé! Rafraîchissez votre navigateur." -ForegroundColor Green
