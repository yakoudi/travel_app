import os
import re

# Liste des fichiers à traiter
files = [
    r"c:\Users\malek\OneDrive\Bureau\travel_app\frontend\travelbook\src\pages\PackageDetailPage.jsx",
    r"c:\Users\malek\OneDrive\Bureau\travel_app\frontend\travelbook\src\pages\MyBookingsPage.jsx",
    r"c:\Users\malek\OneDrive\Bureau\travel_app\frontend\travelbook\src\pages\HotelDetailPage.jsx",
    r"c:\Users\malek\OneDrive\Bureau\travel_app\frontend\travelbook\src\pages\BookingDetailPage.jsx",
    r"c:\Users\malek\OneDrive\Bureau\travel_app\frontend\travelbook\src\components\admin\packages\PackageForm.jsx",
    r"c:\Users\malek\OneDrive\Bureau\travel_app\frontend\travelbook\src\components\admin\flights\FlightForm.jsx",
    r"c:\Users\malek\OneDrive\Bureau\travel_app\frontend\travelbook\src\components\admin\destinations\DestinationForm.jsx",
]

for filepath in files:
    if not os.path.exists(filepath):
        print(f"❌ File not found: {filepath}")
        continue
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Vérifier si le fichier a déjà l'import
        has_import = 'sweetAlert' in content
        
        # Ajouter l'import si nécessaire
        if not has_import:
            # Déterminer le bon chemin
            if '../../../api/' in content or '../../../utils/' in content:
                import_line = "import { showSuccess, showError, showWarning, showInfo } from '../../../utils/sweetAlert';"
            elif '../../api/' in content or '../../utils/' in content:
                import_line = "import { showSuccess, showError, showWarning, showInfo } from '../../utils/sweetAlert';"
            else:
                import_line = "import { showSuccess, showError, showWarning, showInfo } from '../utils/sweetAlert';"
            
            # Trouver la dernière ligne d'import
            lines = content.split('\n')
            last_import_idx = -1
            for i, line in enumerate(lines):
                if line.strip().startswith('import ') and ' from ' in line:
                    last_import_idx = i
            
            if last_import_idx >= 0:
                lines.insert(last_import_idx + 1, import_line)
                content = '\n'.join(lines)
        
        # Remplacer les alerts
        # alert('✅ ...') -> await showSuccess(...)
        content = re.sub(r"alert\('✅\s*([^']+)'\)", r"await showSuccess('\1')", content)
        
        # alert('❌ ...') -> showError(...)
        content = re.sub(r"alert\('❌\s*([^']+)'\)", r"showError('\1')", content)
        
        # alert('Erreur...') -> showError(...)
        content = re.sub(r"alert\('(Erreur[^']*)'\)", r"showError('\1')", content)
        
        # alert('...succès...') -> await showSuccess(...)
        content = re.sub(r"alert\('([^']*succès[^']*)'\)", r"await showSuccess('\1')", content)
        
        # alert('...') -> showWarning(...)
        content = re.sub(r"alert\('([^']*)'\)", r"showWarning('\1')", content)
        
        # Sauvegarder
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ {os.path.basename(filepath)}")
    
    except Exception as e:
        print(f"❌ {os.path.basename(filepath)}: {e}")

print("\n✅ Done!")
