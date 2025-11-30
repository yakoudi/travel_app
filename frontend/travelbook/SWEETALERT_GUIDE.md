# Guide d'utilisation de SweetAlert2

## 📦 Installation

SweetAlert2 a été installé et configuré dans votre application. Un utilitaire a été créé dans `src/utils/sweetAlert.js` pour faciliter son utilisation.

## 🎨 Fonctions disponibles

### 1. **showSuccess** - Alerte de succès
```javascript
import { showSuccess } from '../utils/sweetAlert';

// Utilisation simple
await showSuccess('Opération réussie !');

// Avec titre personnalisé
await showSuccess('Données sauvegardées', 'Succès !');
```

### 2. **showError** - Alerte d'erreur
```javascript
import { showError } from '../utils/sweetAlert';

// Utilisation simple
showError('Une erreur est survenue');

// Avec titre personnalisé
showError('Impossible de charger les données', 'Erreur !');
```

### 3. **showWarning** - Alerte d'avertissement
```javascript
import { showWarning } from '../utils/sweetAlert';

// Utilisation simple
showWarning('Veuillez remplir tous les champs');

// Avec titre personnalisé
showWarning('Certains champs sont vides', 'Attention !');
```

### 4. **showInfo** - Alerte d'information
```javascript
import { showInfo } from '../utils/sweetAlert';

// Utilisation simple
showInfo('Cette fonctionnalité sera bientôt disponible');

// Avec titre personnalisé
showInfo('Mise à jour disponible', 'Information');
```

### 5. **showConfirm** - Dialogue de confirmation
```javascript
import { showConfirm } from '../utils/sweetAlert';

// Utilisation avec async/await
const result = await showConfirm('Êtes-vous sûr de vouloir supprimer cet élément ?');
if (result.isConfirmed) {
  // L'utilisateur a cliqué sur "OK"
  // Effectuer l'action
}

// Avec titre personnalisé
const result = await showConfirm(
  'Cette action est irréversible',
  'Confirmer la suppression'
);
```

### 6. **showToast** - Notification discrète
```javascript
import { showToast } from '../utils/sweetAlert';

// Toast de succès (par défaut)
showToast('Enregistré !');

// Toast d'erreur
showToast('Erreur de connexion', 'error');

// Toast d'information
showToast('Nouvelle notification', 'info');

// Toast d'avertissement
showToast('Attention !', 'warning');
```

## 🔄 Migration effectuée

Tous les anciens `alert()` et `window.confirm()` ont été remplacés par SweetAlert2 dans les fichiers suivants :

### Pages
- ✅ PaymentPage.jsx
- ✅ PackageDetailPage.jsx
- ✅ MyBookingsPage.jsx
- ✅ HotelDetailPage.jsx
- ✅ BookingDetailPage.jsx
- ✅ BookingPage.jsx
- ✅ BookingConfirmationPage.jsx
- ✅ FlightDetailPage.jsx
- ✅ AdminPage.jsx

### Composants Admin
- ✅ AdminBookingsPage.jsx
- ✅ HotelForm.jsx
- ✅ HotelList.jsx
- ✅ PromotionForm.jsx
- ✅ PromotionList.jsx
- ✅ PackageForm.jsx
- ✅ PackageList.jsx
- ✅ FlightForm.jsx
- ✅ FlightList.jsx
- ✅ DestinationForm.jsx
- ✅ DestinationList.jsx

## 🎯 Avantages de SweetAlert2

1. **Design moderne** : Interface élégante et professionnelle
2. **Personnalisable** : Couleurs, icônes, boutons configurables
3. **Responsive** : S'adapte à tous les écrans
4. **Accessible** : Conforme aux standards d'accessibilité
5. **Animations** : Transitions fluides et agréables
6. **Promesses** : Support natif des async/await
7. **Toast** : Notifications discrètes en coin d'écran

## 📝 Exemples d'utilisation

### Exemple 1 : Validation de formulaire
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!formData.email) {
    showWarning('Veuillez entrer votre email');
    return;
  }
  
  try {
    await api.submit(formData);
    await showSuccess('Formulaire envoyé avec succès !');
  } catch (error) {
    showError('Erreur lors de l\'envoi');
  }
};
```

### Exemple 2 : Suppression avec confirmation
```javascript
const handleDelete = async (id) => {
  const result = await showConfirm(
    'Êtes-vous sûr de vouloir supprimer cet élément ?',
    'Confirmer la suppression'
  );
  
  if (result.isConfirmed) {
    try {
      await api.delete(id);
      await showSuccess('Élément supprimé avec succès');
      loadData();
    } catch (error) {
      showError('Erreur lors de la suppression');
    }
  }
};
```

### Exemple 3 : Toast pour notifications rapides
```javascript
const handleSave = async () => {
  try {
    await api.save(data);
    showToast('Sauvegardé !', 'success');
  } catch (error) {
    showToast('Erreur de sauvegarde', 'error');
  }
};
```

## 🔧 Configuration

La configuration par défaut se trouve dans `src/utils/sweetAlert.js`. Vous pouvez la modifier selon vos besoins :

```javascript
const defaultConfig = {
  confirmButtonColor: '#3085d6',
  cancelButtonColor: '#d33',
  confirmButtonText: 'OK',
  cancelButtonText: 'Annuler',
};
```

## 📚 Documentation complète

Pour plus d'informations, consultez la documentation officielle :
https://sweetalert2.github.io/
