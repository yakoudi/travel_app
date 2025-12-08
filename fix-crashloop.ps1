# Script de correction pour les pods en CrashLoopBackOff
# Usage: .\fix-crashloop.ps1

Write-Host "=== Correction des Pods en CrashLoopBackOff ===" -ForegroundColor Green
Write-Host ""

# 1. Identifier les pods en erreur
Write-Host "1. Identification des pods en erreur..." -ForegroundColor Yellow
kubectl get pods | Select-String "CrashLoopBackOff"

Write-Host ""
Write-Host "2. Suppression des anciens ReplicaSets..." -ForegroundColor Yellow

# Supprimer le ReplicaSet problématique
kubectl delete replicaset travel-backend-75b6f879f5 --ignore-not-found=true

Write-Host ""
Write-Host "3. Redémarrage du déploiement backend..." -ForegroundColor Yellow
kubectl rollout restart deployment/travel-backend

Write-Host ""
Write-Host "4. Attente de la stabilisation..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "5. Vérification du statut..." -ForegroundColor Yellow
kubectl rollout status deployment/travel-backend

Write-Host ""
Write-Host "6. État final des pods:" -ForegroundColor Green
kubectl get pods

Write-Host ""
Write-Host "=== Correction terminée ===" -ForegroundColor Green
Write-Host ""
Write-Host "Si des pods sont toujours en erreur, exécutez:" -ForegroundColor Cyan
Write-Host "  .\make.ps1 logs-backend" -ForegroundColor White
Write-Host "  kubectl describe pod <nom-du-pod>" -ForegroundColor White
