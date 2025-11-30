import os
import re

# Chemins des fichiers à modifier
files_to_update = [
    r"c:\Users\malek\OneDrive\Bureau\travel_app\frontend\travelbook\src\components\admin\promotions\PromotionForm.jsx",
    r"c:\Users\malek\OneDrive\Bureau\travel_app\frontend\travelbook\src\components\admin\promotions\PromotionList.jsx",
    r"c:\Users\malek\OneDrive\Bureau\travel_app\frontend\travelbook\src\components\admin\packages\PackageList.jsx",
    r"c:\Users\malek\OneDrive\Bureau\travel_app\frontend\travelbook\src\components\admin\packages\PackageForm.jsx",
    r"c:\Users\malek\OneDrive\Bureau\travel_app\frontend\travelbook\src\components\admin\destinations\DestinationList.jsx",
    r"c:\Users\malek\OneDrive\Bureau\travel_app\frontend\travelbook\src\components\admin\destinations\DestinationForm.jsx",
    r"c:\Users\malek\OneDrive\Bureau\travel_app\frontend\travelbook\src\components\admin\flights\FlightForm.jsx",
    r"c:\Users\malek\OneDrive\Bureau\travel_app\frontend\travelbook\src\components\admin\flights\FlightList.jsx",
    r"c:\Users\malek\OneDrive\Bureau\travel_app\frontend\travelbook\src\components\admin\AdminBookingsPage.jsx",
    r"c:\Users\malek\OneDrive\Bureau\travel_app\frontend\travelbook\src\pages\BookingConfirmationPage.jsx",
    r"c:\Users\malek\OneDrive\Bureau\travel_app\frontend\travelbook\src\pages\BookingDetailPage.jsx",
    r"c:\Users\malek\OneDrive\Bureau\travel_app\frontend\travelbook\src\pages\BookingPage.jsx",
    r"c:\Users\malek\OneDrive\Bureau\travel_app\frontend\travelbook\src\pages\FlightDetailPage.jsx",
    r"c:\Users\malek\OneDrive\Bureau\travel_app\frontend\travelbook\src\pages\HotelDetailPage.jsx",
    r"c:\Users\malek\OneDrive\Bureau\travel_app\frontend\travelbook\src\pages\MyBookingsPage.jsx",
]

def add_import_if_needed(content):
    """Ajoute l'import SweetAlert2 si nécessaire"""
    if "from '../../../utils/sweetAlert'" in content or "from '../../utils/sweetAlert'" in content:
        return content
    
    # Trouver la dernière ligne d'import
    import_pattern = r"(import .+ from .+;)"
    imports = list(re.finditer(import_pattern, content))
    
    if imports:
        last_import = imports[-1]
        # Déterminer le bon chemin relatif
        if "../../../api/" in content:
            import_statement = "import { showSuccess, showError, showWarning, showInfo, showConfirm, showToast } from '../../../utils/sweetAlert';"
        elif "../../api/" in content:
            import_statement = "import { showSuccess, showError, showWarning, showInfo, showConfirm, showToast } from '../../utils/sweetAlert';"
        else:
            import_statement = "import { showSuccess, showError, showWarning, showInfo, showConfirm, showToast } from '../utils/sweetAlert';"
        
        # Insérer après le dernier import
        pos = last_import.end()
        content = content[:pos] + "\n" + import_statement + content[pos:]
    
    return content

def replace_alerts(content):
    """Remplace tous les alert() par SweetAlert2"""
    
    # Remplacer alert('✅ ...') par showSuccess
    content = re.sub(
        r"alert\('✅\s*([^']+)'\)",
        r"await showSuccess('\1')",
        content
    )
    
    # Remplacer alert('❌ ...') par showError
    content = re.sub(
        r"alert\('❌\s*([^']+)'\)",
        r"showError('\1')",
        content
    )
    
    # Remplacer les alerts de succès (contenant "succès" ou "créé" ou "modifié" ou "supprimé")
    content = re.sub(
        r"alert\('([^']*(?:succès|créé|modifié|supprimé|mis à jour)[^']*)'\)",
        r"await showSuccess('\1')",
        content
    )
    
    # Remplacer les alerts d'erreur (contenant "Erreur" ou "erreur")
    content = re.sub(
        r"alert\('([^']*[Ee]rreur[^']*)'\)",
        r"showError('\1')",
        content
    )
    
    # Remplacer les alerts d'information (📄, 💡, etc.)
    content = re.sub(
        r"alert\('([📄💡ℹ️][^']*)'\)",
        r"showInfo('\1')",
        content
    )
    
    # Remplacer les autres alerts par showWarning
    content = re.sub(
        r"alert\('([^']*)'\)",
        r"showWarning('\1')",
        content
    )
    
    # Remplacer window.confirm par showConfirm
    content = re.sub(
        r"if\s*\(\s*!window\.confirm\('([^']+)'\)\s*\)\s*\{",
        r"const result = await showConfirm('\1');\n    if (!result.isConfirmed) {",
        content
    )
    
    # Remplacer onClick={() => alert(...)} par onClick={async () => await showInfo(...)}
    content = re.sub(
        r"onClick=\{\(\) => alert\('([^']+)'\)\}",
        r"onClick={async () => await showInfo('\1')}",
        content
    )
    
    return content

def process_file(filepath):
    """Traite un fichier"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Vérifier si le fichier contient des alerts
        if 'alert(' not in content and 'window.confirm(' not in content:
            print(f"✓ {os.path.basename(filepath)} - Aucun alert à remplacer")
            return
        
        # Ajouter l'import
        content = add_import_if_needed(content)
        
        # Remplacer les alerts
        content = replace_alerts(content)
        
        # Écrire le fichier modifié
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✓ {os.path.basename(filepath)} - Modifié avec succès")
    
    except Exception as e:
        print(f"✗ {os.path.basename(filepath)} - Erreur: {e}")

def main():
    print("🔄 Remplacement des alerts par SweetAlert2...\n")
    
    for filepath in files_to_update:
        if os.path.exists(filepath):
            process_file(filepath)
        else:
            print(f"✗ {os.path.basename(filepath)} - Fichier introuvable")
    
    print("\n✅ Terminé!")

if __name__ == "__main__":
    main()
