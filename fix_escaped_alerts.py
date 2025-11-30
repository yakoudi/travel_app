import os

files_to_fix = {
    r"c:\Users\malek\OneDrive\Bureau\travel_app\frontend\travelbook\src\pages\MyBookingsPage.jsx": [
        ("alert('❌ Erreur lors de l\\'annulation');", "showError('Erreur lors de l\\'annulation');")
    ],
    r"c:\Users\malek\OneDrive\Bureau\travel_app\frontend\travelbook\src\pages\HotelDetailPage.jsx": [
        ("alert('Erreur lors du chargement de l\\'hôtel');", "showError('Erreur lors du chargement de l\\'hôtel');")
    ],
    r"c:\Users\malek\OneDrive\Bureau\travel_app\frontend\travelbook\src\pages\BookingDetailPage.jsx": [
        ("alert('❌ Erreur lors de l\\'annulation');", "showError('Erreur lors de l\\'annulation');")
    ],
    r"c:\Users\malek\OneDrive\Bureau\travel_app\frontend\travelbook\src\components\admin\promotions\PromotionForm.jsx": [
        ("alert('Erreur lors de l\\'enregistrement');", "showError('Erreur lors de l\\'enregistrement');")
    ],
    r"c:\Users\malek\OneDrive\Bureau\travel_app\frontend\travelbook\src\components\admin\packages\PackageForm.jsx": [
        ("alert('Erreur lors de l\\'enregistrement');", "showError('Erreur lors de l\\'enregistrement');")
    ],
    r"c:\Users\malek\OneDrive\Bureau\travel_app\frontend\travelbook\src\components\admin\flights\FlightForm.jsx": [
        ("alert('L\\'heure d\\'arrivée doit être après l\\'heure de départ');", "showWarning('L\\'heure d\\'arrivée doit être après l\\'heure de départ');"),
        ("alert('Erreur lors de l\\'enregistrement');", "showError('Erreur lors de l\\'enregistrement');")
    ],
    r"c:\Users\malek\OneDrive\Bureau\travel_app\frontend\travelbook\src\components\admin\destinations\DestinationForm.jsx": [
        ("alert('Erreur lors de l\\'enregistrement');", "showError('Erreur lors de l\\'enregistrement');")
    ],
}

for filepath, replacements in files_to_fix.items():
    if not os.path.exists(filepath):
        print(f"❌ File not found: {filepath}")
        continue
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        for old, new in replacements:
            content = content.replace(old, new)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ {os.path.basename(filepath)}")
    
    except Exception as e:
        print(f"❌ {os.path.basename(filepath)}: {e}")

print("\n✅ All alerts replaced!")
