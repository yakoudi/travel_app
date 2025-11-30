# 🎨 SweetAlert2 - Guide de Démarrage Rapide

## 🚀 C'est fait !

Tous les `alert()` et `window.confirm()` de votre application ont été remplacés par **SweetAlert2** ! 🎉

## 📦 Ce qui a été installé

```bash
npm install sweetalert2
```

## 🎯 Utilisation rapide

### Import
```javascript
import { showSuccess, showError, showWarning, showInfo, showConfirm, showToast } from '../utils/sweetAlert';
```

### Exemples

#### ✅ Succès
```javascript
await showSuccess('Hôtel créé avec succès !');
```

#### ❌ Erreur
```javascript
showError('Erreur lors du chargement');
```

#### ⚠️ Avertissement
```javascript
showWarning('Veuillez remplir tous les champs');
```

#### ℹ️ Information
```javascript
showInfo('Cette fonctionnalité arrive bientôt');
```

#### ❓ Confirmation
```javascript
const result = await showConfirm('Voulez-vous supprimer cet élément ?');
if (result.isConfirmed) {
  // Action confirmée
}
```

#### 🔔 Toast (notification discrète)
```javascript
showToast('Sauvegardé !', 'success');
```

## 🎨 Tester la démo

Une page de démonstration a été créée : `src/pages/SweetAlertDemo.jsx`

Pour l'ajouter à votre application, ajoutez cette route dans votre routeur :

```javascript
import SweetAlertDemo from './pages/SweetAlertDemo';

// Dans vos routes
<Route path="/sweetalert-demo" element={<SweetAlertDemo />} />
```

Puis accédez à : `http://localhost:3000/sweetalert-demo`

## 📚 Documentation complète

Consultez les fichiers suivants pour plus d'informations :

- **SWEETALERT_GUIDE.md** - Guide complet avec tous les exemples
- **SWEETALERT_MIGRATION.md** - Résumé de la migration effectuée
- **src/utils/sweetAlert.js** - Code source de l'utilitaire

## 🎉 Profitez de vos nouvelles alertes !

Vos utilisateurs vont adorer la nouvelle expérience ! ✨
