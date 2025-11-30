# Script PowerShell pour remplacer tous les alerts restants

$files = @(
    "c:\Users\malek\OneDrive\Bureau\travel_app\frontend\travelbook\src\pages\PaymentPage.jsx",
    "c:\Users\malek\OneDrive\Bureau\travel_app\frontend\travelbook\src\pages\PackageDetailPage.jsx",
    "c:\Users\malek\OneDrive\Bureau\travel_app\frontend\travelbook\src\pages\MyBookingsPage.jsx",
    "c:\Users\malek\OneDrive\Bureau\travel_app\frontend\travelbook\src\pages\HotelDetailPage.jsx",
    "c:\Users\malek\OneDrive\Bureau\travel_app\frontend\travelbook\src\pages\BookingDetailPage.jsx",
    "c:\Users\malek\OneDrive\Bureau\travel_app\frontend\travelbook\src\components\admin\packages\PackageForm.jsx",
    "c:\Users\malek\OneDrive\Bureau\travel_app\frontend\travelbook\src\components\admin\flights\FlightForm.jsx",
    "c:\Users\malek\OneDrive\Bureau\travel_app\frontend\travelbook\src\components\admin\destinations\DestinationForm.jsx"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Processing: $file"
        $content = Get-Content $file -Raw -Encoding UTF8
        
        # Ajouter l'import si nécessaire
        if ($content -notmatch "from.*sweetAlert") {
            if ($content -match "from '\.\./\.\./\.\./api/") {
                $import = "import { showSuccess, showError, showWarning, showInfo, showConfirm, showToast } from '../../../utils/sweetAlert';"
            } elseif ($content -match "from '\.\./\.\./api/") {
                $import = "import { showSuccess, showError, showWarning, showInfo, showConfirm, showToast } from '../../utils/sweetAlert';"
            } else {
                $import = "import { showSuccess, showError, showWarning, showInfo, showConfirm, showToast } from '../utils/sweetAlert';"
            }
            
            # Trouver la dernière ligne d'import
            $lines = $content -split "`r`n"
            $lastImportIndex = -1
            for ($i = 0; $i -lt $lines.Length; $i++) {
                if ($lines[$i] -match "^import .+ from") {
                    $lastImportIndex = $i
                }
            }
            
            if ($lastImportIndex -ge 0) {
                $lines = $lines[0..$lastImportIndex] + $import + $lines[($lastImportIndex+1)..($lines.Length-1)]
                $content = $lines -join "`r`n"
            }
        }
        
        # Remplacer les alerts
        $content = $content -replace "alert\('✅\s*([^']+)'\)", "await showSuccess('`$1')"
        $content = $content -replace "alert\('❌\s*([^']+)'\)", "showError('`$1')"
        $content = $content -replace "alert\('([^']*succès[^']*)'\)", "await showSuccess('`$1')"
        $content = $content -replace "alert\('([^']*créé[^']*)'\)", "await showSuccess('`$1')"
        $content = $content -replace "alert\('([^']*modifié[^']*)'\)", "await showSuccess('`$1')"
        $content = $content -replace "alert\('([^']*supprimé[^']*)'\)", "await showSuccess('`$1')"
        $content = $content -replace "alert\('([^']*[Ee]rreur[^']*)'\)", "showError('`$1')"
        $content = $content -replace "alert\('([📄💡ℹ️][^']*)'\)", "showInfo('`$1')"
        $content = $content -replace "alert\('([^']*)'\)", "showWarning('`$1')"
        $content = $content -replace "onClick=\{\(\) => alert\('([^']+)'\)\}", "onClick={async () => await showInfo('`$1')}"
        
        # Sauvegarder
        $content | Set-Content $file -Encoding UTF8 -NoNewline
        Write-Host "  ✓ Done"
    } else {
        Write-Host "  ✗ File not found: $file"
    }
}

Write-Host "`n✅ All files processed!"
