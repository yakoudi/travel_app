const fs = require('fs');
const path = require('path');

// Fichiers à corriger
const files = [
  'src/pages/BookingPage.jsx',
  'src/pages/HotelDetailPage.jsx'
];

// Mapping des caractères mal encodés vers les bons caractères
const replacements = {
  'R├®server': 'Réserver',
  'h├┤tel': 'hôtel',
  '├®l├®ment': 'élément',
  '├®toiles': 'étoiles',
  'd├®but': 'début',
  'sp├®ciales': 'spéciales',
  'H├┤tel': 'Hôtel',
  '├á': 'à',
  'arriv├®e': 'arrivée',
  'd├®part': 'départ',
  '├ëquipements': 'Équipements',
  'imm├®diate': 'immédiate',
  'R├®servation': 'Réservation',
  '├Ç': 'À',
  'Ô£ô': '✓',
  'En-t├¬te': 'En-tête',
  '├®': 'é',
  '├á': 'à',
  '├¿': 'è',
  '├┤': 'ô',
  '├¬': 'ê',
  '├ë': 'É',
  '├ù': '×',
  '­ƒôì': '📍',
  'Ô¡É': '⭐',
  'si├¿ge': 'siège',
  'c├┤t├®': 'côté',
  'fen├¬tre': 'fenêtre',
  'r├®gime': 'régime',
  'g├®n├®rales': 'générales',
  'Pr├®parer': 'Préparer',
  'donn├®es': 'données',
  'r├®servation': 'réservation',
  'Cr├®er': 'Créer',
  'Dur├®e': 'Durée'
};

console.log('🔧 Correction de l\'encodage des fichiers...\n');

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ Fichier non trouvé: ${file}`);
    return;
  }
  
  try {
    // Lire le fichier
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Appliquer tous les remplacements
    let modified = false;
    Object.keys(replacements).forEach(bad => {
      if (content.includes(bad)) {
        content = content.split(bad).join(replacements[bad]);
        modified = true;
      }
    });
    
    if (modified) {
      // Écrire le fichier corrigé
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ ${file} - Corrigé`);
    } else {
      console.log(`ℹ️  ${file} - Aucune correction nécessaire`);
    }
  } catch (error) {
    console.log(`❌ Erreur avec ${file}:`, error.message);
  }
});

console.log('\n✨ Terminé! Rafraîchissez votre navigateur.');
