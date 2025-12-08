# Script de Migration : Gemini → OpenAI
# Ce script vous guide pas à pas pour changer l'API du chatbot

Write-Host "🤖 Migration de l'API Chatbot : Gemini → OpenAI" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Étape 1 : Vérifier les fichiers
Write-Host "📋 Étape 1 : Vérification des fichiers..." -ForegroundColor Yellow
$files = @(
    "travel-todo\chatbot\bot_intelligence.py",
    "travel-todo\chatbot\gemini_intelligence.py",
    "travel-todo\chatbot\openai_intelligence.py"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file existe" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file manquant" -ForegroundColor Red
    }
}
Write-Host ""

# Étape 2 : Demander la clé API OpenAI
Write-Host "🔑 Étape 2 : Configuration de la clé API OpenAI" -ForegroundColor Yellow
Write-Host "Avez-vous une clé API OpenAI ? (O/N)" -ForegroundColor Cyan
$hasKey = Read-Host

if ($hasKey -eq "O" -or $hasKey -eq "o") {
    Write-Host "Entrez votre clé API OpenAI (elle sera masquée) :" -ForegroundColor Cyan
    $apiKey = Read-Host -AsSecureString
    $apiKeyPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($apiKey)
    )
    
    # Créer ou mettre à jour le fichier .env
    $envContent = ""
    if (Test-Path ".env") {
        $envContent = Get-Content ".env" -Raw
    }
    
    # Ajouter ou remplacer la clé OpenAI
    if ($envContent -match "OPENAI_API_KEY=") {
        $envContent = $envContent -replace "OPENAI_API_KEY=.*", "OPENAI_API_KEY=$apiKeyPlain"
    } else {
        $envContent += "`nOPENAI_API_KEY=$apiKeyPlain`n"
    }
    
    Set-Content ".env" $envContent
    Write-Host "  ✅ Clé API sauvegardée dans .env" -ForegroundColor Green
} else {
    Write-Host "  ℹ️  Vous pouvez obtenir une clé sur : https://platform.openai.com/" -ForegroundColor Blue
    Write-Host "  ⚠️  Migration annulée. Obtenez d'abord une clé API." -ForegroundColor Yellow
    exit
}
Write-Host ""

# Étape 3 : Créer une sauvegarde
Write-Host "💾 Étape 3 : Création d'une sauvegarde..." -ForegroundColor Yellow
$backupDir = "backup_chatbot_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
Copy-Item "travel-todo\chatbot\bot_intelligence.py" "$backupDir\" -Force
Write-Host "  ✅ Sauvegarde créée dans : $backupDir" -ForegroundColor Green
Write-Host ""

# Étape 4 : Modifier bot_intelligence.py
Write-Host "🔧 Étape 4 : Modification de bot_intelligence.py..." -ForegroundColor Yellow

$botIntelligencePath = "travel-todo\chatbot\bot_intelligence.py"
$content = Get-Content $botIntelligencePath -Raw

# Remplacer les imports
$content = $content -replace "from \.gemini_intelligence import GeminiChatbot", "from .openai_intelligence import OpenAIChatbot"
$content = $content -replace "GEMINI_AVAILABLE = True", "OPENAI_AVAILABLE = True"
$content = $content -replace "GEMINI_AVAILABLE = False", "OPENAI_AVAILABLE = False"
$content = $content -replace "⚠️ Gemini non disponible:", "⚠️ OpenAI non disponible:"

# Remplacer les initialisations
$content = $content -replace "self\.gemini = None", "self.ai_engine = None"
$content = $content -replace "if GEMINI_AVAILABLE:", "if OPENAI_AVAILABLE:"
$content = $content -replace "self\.gemini = GeminiChatbot\(\)", "self.ai_engine = OpenAIChatbot()"
$content = $content -replace "✅ Gemini AI activé!", "✅ OpenAI activé!"
$content = $content -replace "⚠️ Impossible d'initialiser Gemini:", "⚠️ Impossible d'initialiser OpenAI:"

# Remplacer toutes les utilisations
$content = $content -replace "if self\.gemini:", "if self.ai_engine:"
$content = $content -replace "self\.gemini\.analyze_message", "self.ai_engine.analyze_message"
$content = $content -replace "self\.gemini\.generate_response_with_recommendations", "self.ai_engine.generate_response_with_recommendations"
$content = $content -replace "self\.gemini\.generate_conversational_response", "self.ai_engine.generate_conversational_response"
$content = $content -replace "Erreur analyse Gemini:", "Erreur analyse OpenAI:"
$content = $content -replace "Erreur Gemini \(avec recs\):", "Erreur OpenAI (avec recs):"
$content = $content -replace "Erreur Gemini \(conversationnel\):", "Erreur OpenAI (conversationnel):"

# Sauvegarder les modifications
Set-Content $botIntelligencePath $content
Write-Host "  ✅ Fichier modifié avec succès" -ForegroundColor Green
Write-Host ""

# Étape 5 : Installer les dépendances
Write-Host "📦 Étape 5 : Installation des dépendances..." -ForegroundColor Yellow
Write-Host "Voulez-vous installer 'openai' via pip ? (O/N)" -ForegroundColor Cyan
$installDeps = Read-Host

if ($installDeps -eq "O" -or $installDeps -eq "o") {
    Write-Host "  Installation en cours..." -ForegroundColor Blue
    pip install openai
    Write-Host "  ✅ Dépendances installées" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  N'oubliez pas d'installer 'openai' : pip install openai" -ForegroundColor Yellow
}
Write-Host ""

# Étape 6 : Résumé
Write-Host "✅ Migration terminée !" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Résumé des changements :" -ForegroundColor Cyan
Write-Host "  • Sauvegarde créée dans : $backupDir" -ForegroundColor White
Write-Host "  • bot_intelligence.py modifié (Gemini → OpenAI)" -ForegroundColor White
Write-Host "  • Clé API OpenAI configurée dans .env" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Prochaines étapes :" -ForegroundColor Cyan
Write-Host "  1. Vérifiez le fichier .env" -ForegroundColor White
Write-Host "  2. Redémarrez le serveur Django : python manage.py runserver" -ForegroundColor White
Write-Host "  3. Testez le chatbot via l'interface" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentation complète : GUIDE_CHANGEMENT_API_CHATBOT.md" -ForegroundColor Blue
Write-Host ""
Write-Host "⚠️  En cas de problème, restaurez la sauvegarde :" -ForegroundColor Yellow
Write-Host "  Copy-Item '$backupDir\bot_intelligence.py' 'travel-todo\chatbot\' -Force" -ForegroundColor Gray
Write-Host ""
