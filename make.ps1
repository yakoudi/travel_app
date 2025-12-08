# PowerShell equivalent of Makefile for Travel App DevOps
# Usage: .\make.ps1 <command>

param(
    [Parameter(Position=0)]
    [string]$Command = "help",
    
    [Parameter(ValueFromRemainingArguments=$true)]
    [string[]]$Args
)

# Variables
$BACKEND_IMAGE = "travel-backend:latest"
$FRONTEND_IMAGE = "travel-frontend:latest"

# Colors
function Write-Green { Write-Host $args -ForegroundColor Green }
function Write-Yellow { Write-Host $args -ForegroundColor Yellow }
function Write-Red { Write-Host $args -ForegroundColor Red }

# Commands
switch ($Command.ToLower()) {
    "help" {
        Write-Green "Travel App DevOps - Commandes Disponibles"
        Write-Host ""
        Write-Host "DOCKER:"
        Write-Host "  build              - Construire les images Docker"
        Write-Host "  build-backend      - Construire uniquement l'image backend"
        Write-Host "  build-frontend     - Construire uniquement l'image frontend"
        Write-Host "  docker-up          - Lancer avec Docker Compose"
        Write-Host "  docker-down        - Arrêter Docker Compose"
        Write-Host "  docker-logs        - Voir les logs Docker Compose"
        Write-Host ""
        Write-Host "KUBERNETES:"
        Write-Host "  deploy             - Déployer sur Kubernetes (après build)"
        Write-Host "  deploy-config      - Déployer uniquement ConfigMap et Secrets"
        Write-Host "  deploy-db          - Déployer uniquement la base de données"
        Write-Host "  deploy-backend     - Déployer uniquement le backend"
        Write-Host "  deploy-frontend    - Déployer uniquement le frontend"
        Write-Host "  deploy-monitoring  - Déployer uniquement le monitoring"
        Write-Host "  status             - Voir le statut des ressources Kubernetes"
        Write-Host "  pods               - Lister les pods"
        Write-Host "  services           - Lister les services"
        Write-Host "  all                - Voir toutes les ressources"
        Write-Host ""
        Write-Host "LOGS & DEBUG:"
        Write-Host "  logs-backend       - Voir les logs du backend"
        Write-Host "  logs-frontend      - Voir les logs du frontend"
        Write-Host "  logs-db            - Voir les logs de la base de données"
        Write-Host "  logs-prometheus    - Voir les logs de Prometheus"
        Write-Host "  logs-grafana       - Voir les logs de Grafana"
        Write-Host "  describe-backend   - Décrire un pod backend"
        Write-Host "  describe-frontend  - Décrire un pod frontend"
        Write-Host "  events             - Voir les événements récents"
        Write-Host ""
        Write-Host "SCALING:"
        Write-Host "  scale-backend      - Scaler le backend"
        Write-Host "  scale-frontend     - Scaler le frontend"
        Write-Host ""
        Write-Host "PORT FORWARDING:"
        Write-Host "  port-backend       - Port-forward backend (localhost:8000)"
        Write-Host "  port-frontend      - Port-forward frontend (localhost:3000)"
        Write-Host "  port-prometheus    - Port-forward Prometheus (localhost:9090)"
        Write-Host "  port-grafana       - Port-forward Grafana (localhost:3100)"
        Write-Host ""
        Write-Host "RESTART & ROLLOUT:"
        Write-Host "  restart-backend    - Redémarrer le backend"
        Write-Host "  restart-frontend   - Redémarrer le frontend"
        Write-Host "  rollback-backend   - Rollback du backend"
        Write-Host "  rollback-frontend  - Rollback du frontend"
        Write-Host ""
        Write-Host "TESTS & DEMO:"
        Write-Host "  test-autoheal      - Tester l'auto-healing"
        Write-Host "  demo               - Lancer une démonstration complète"
        Write-Host ""
        Write-Host "CLEANUP:"
        Write-Host "  clean              - Supprimer tous les déploiements Kubernetes"
        Write-Host "  clean-all          - Supprimer tout (Kubernetes + Docker)"
        Write-Host ""
        Write-Host "MONITORING:"
        Write-Host "  top                - Voir l'utilisation des ressources"
        Write-Host "  metrics            - Voir les métriques détaillées"
        Write-Host ""
        Write-Host "UTILITAIRES:"
        Write-Host "  shell-backend      - Ouvrir un shell dans un pod backend"
        Write-Host "  shell-frontend     - Ouvrir un shell dans un pod frontend"
        Write-Host "  shell-db           - Ouvrir un shell dans le pod PostgreSQL"
        Write-Host "  watch              - Surveiller les pods en temps réel"
        Write-Host "  context            - Afficher le contexte Kubernetes actuel"
    }
    
    "build" {
        Write-Green "Construction des images Docker..."
        docker build -t $BACKEND_IMAGE ./travel-todo
        docker build -t $FRONTEND_IMAGE ./frontend/travelbook
        Write-Green "Images construites avec succès"
    }
    
    "build-backend" {
        Write-Green "Construction de l'image backend..."
        docker build -t $BACKEND_IMAGE ./travel-todo
    }
    
    "build-frontend" {
        Write-Green "Construction de l'image frontend..."
        docker build -t $FRONTEND_IMAGE ./frontend/travelbook
    }
    
    "docker-up" {
        Write-Green "Lancement avec Docker Compose..."
        docker-compose up -d
        Write-Green "Services démarrés"
    }
    
    "docker-down" {
        Write-Yellow "Arrêt de Docker Compose..."
        docker-compose down
    }
    
    "docker-logs" {
        docker-compose logs -f
    }
    
    "deploy" {
        Write-Green "Déploiement sur Kubernetes..."
        kubectl apply -f k8s/configmap.yaml
        kubectl apply -f k8s/secrets.yaml
        kubectl apply -f k8s/database-statefulset.yaml
        kubectl apply -f k8s/backend.yaml
        kubectl apply -f k8s/frontend.yaml
        kubectl apply -f k8s/monitoring/
        Write-Green "Déploiement terminé"
    }
    
    "deploy-config" {
        kubectl apply -f k8s/configmap.yaml
        kubectl apply -f k8s/secrets.yaml
    }
    
    "deploy-db" {
        kubectl apply -f k8s/database-statefulset.yaml
    }
    
    "deploy-backend" {
        kubectl apply -f k8s/backend.yaml
    }
    
    "deploy-frontend" {
        kubectl apply -f k8s/frontend.yaml
    }
    
    "deploy-monitoring" {
        kubectl apply -f k8s/monitoring/
    }
    
    "status" {
        Write-Green "=== Pods ==="
        kubectl get pods
        Write-Host ""
        Write-Green "=== Services ==="
        kubectl get services
        Write-Host ""
        Write-Green "=== Deployments ==="
        kubectl get deployments
    }
    
    "pods" {
        kubectl get pods -o wide
    }
    
    "services" {
        kubectl get services
    }
    
    "all" {
        kubectl get all
    }
    
    "logs-backend" {
        kubectl logs -l app=travel-backend --tail=100 -f
    }
    
    "logs-frontend" {
        kubectl logs -l app=travel-frontend --tail=100 -f
    }
    
    "logs-db" {
        kubectl logs postgres-0 --tail=100 -f
    }
    
    "logs-prometheus" {
        kubectl logs -l app=prometheus --tail=100 -f
    }
    
    "logs-grafana" {
        kubectl logs -l app=grafana --tail=100 -f
    }
    
    "describe-backend" {
        $pod = kubectl get pods -l app=travel-backend -o jsonpath='{.items[0].metadata.name}'
        kubectl describe pod $pod
    }
    
    "describe-frontend" {
        $pod = kubectl get pods -l app=travel-frontend -o jsonpath='{.items[0].metadata.name}'
        kubectl describe pod $pod
    }
    
    "events" {
        kubectl get events --sort-by=.metadata.creationTimestamp
    }
    
    "scale-backend" {
        $replicas = if ($Args.Count -gt 0) { $Args[0] } else { "3" }
        Write-Green "Scaling backend à $replicas replicas..."
        kubectl scale deployment travel-backend --replicas=$replicas
    }
    
    "scale-frontend" {
        $replicas = if ($Args.Count -gt 0) { $Args[0] } else { "3" }
        Write-Green "Scaling frontend à $replicas replicas..."
        kubectl scale deployment travel-frontend --replicas=$replicas
    }
    
    "port-backend" {
        Write-Green "Backend accessible sur http://localhost:8000"
        kubectl port-forward service/travel-backend-service 8000:8000
    }
    
    "port-frontend" {
        Write-Green "Frontend accessible sur http://localhost:3000"
        kubectl port-forward service/travel-frontend-service 3000:3000
    }
    
    "port-prometheus" {
        Write-Green "Prometheus accessible sur http://localhost:9090"
        kubectl port-forward service/prometheus-service 9090:9090
    }
    
    "port-grafana" {
        Write-Green "Grafana accessible sur http://localhost:3100 (admin/admin)"
        kubectl port-forward service/grafana-service 3100:3000
    }
    
    "restart-backend" {
        Write-Yellow "Redémarrage du backend..."
        kubectl rollout restart deployment/travel-backend
        kubectl rollout status deployment/travel-backend
    }
    
    "restart-frontend" {
        Write-Yellow "Redémarrage du frontend..."
        kubectl rollout restart deployment/travel-frontend
        kubectl rollout status deployment/travel-frontend
    }
    
    "rollback-backend" {
        Write-Red "Rollback du backend..."
        kubectl rollout undo deployment/travel-backend
    }
    
    "rollback-frontend" {
        Write-Red "Rollback du frontend..."
        kubectl rollout undo deployment/travel-frontend
    }
    
    "test-autoheal" {
        Write-Yellow "Test de l'auto-healing..."
        $pod = kubectl get pods -l app=travel-backend -o jsonpath='{.items[0].metadata.name}'
        Write-Host "Suppression du pod $pod..."
        kubectl delete pod $pod
        Write-Green "Vérifiez que le pod est recréé automatiquement :"
        kubectl get pods -w
    }
    
    "demo" {
        Write-Green "=== DÉMONSTRATION DEVOPS ==="
        Write-Host ""
        Write-Yellow "1. Construction des images..."
        & $PSCommandPath build
        Write-Host ""
        Write-Yellow "2. Déploiement sur Kubernetes..."
        & $PSCommandPath deploy
        Write-Host ""
        Write-Yellow "3. Attente du démarrage des pods..."
        Start-Sleep -Seconds 10
        Write-Host ""
        Write-Yellow "4. Statut des ressources :"
        & $PSCommandPath status
        Write-Host ""
        Write-Green "Démonstration prête !"
        Write-Host ""
        Write-Host "Accès aux services :"
        Write-Host "  - Backend:    .\make.ps1 port-backend"
        Write-Host "  - Frontend:   .\make.ps1 port-frontend"
        Write-Host "  - Prometheus: .\make.ps1 port-prometheus"
        Write-Host "  - Grafana:    .\make.ps1 port-grafana"
    }
    
    "clean" {
        Write-Red "Suppression des déploiements..."
        kubectl delete -f k8s/ --ignore-not-found=true
        kubectl delete -f k8s/monitoring/ --ignore-not-found=true
        Write-Green "Nettoyage terminé"
    }
    
    "clean-all" {
        & $PSCommandPath clean
        Write-Red "Suppression des images Docker..."
        docker rmi $BACKEND_IMAGE $FRONTEND_IMAGE --force 2>$null
        Write-Green "Nettoyage complet terminé"
    }
    
    "top" {
        Write-Green "=== Utilisation des Pods ==="
        kubectl top pods
        Write-Host ""
        Write-Green "=== Utilisation des Nodes ==="
        kubectl top nodes
    }
    
    "metrics" {
        Write-Green "=== Métriques des Pods ==="
        kubectl get pods -o custom-columns=NAME:.metadata.name,CPU:.spec.containers[*].resources.requests.cpu,MEMORY:.spec.containers[*].resources.requests.memory
    }
    
    "shell-backend" {
        $pod = kubectl get pods -l app=travel-backend -o jsonpath='{.items[0].metadata.name}'
        Write-Green "Connexion au pod $pod..."
        kubectl exec -it $pod -- bash
    }
    
    "shell-frontend" {
        $pod = kubectl get pods -l app=travel-frontend -o jsonpath='{.items[0].metadata.name}'
        Write-Green "Connexion au pod $pod..."
        kubectl exec -it $pod -- sh
    }
    
    "shell-db" {
        Write-Green "Connexion à PostgreSQL..."
        kubectl exec -it postgres-0 -- psql -U postgres -d travel_todo_db
    }
    
    "watch" {
        kubectl get pods -w
    }
    
    "context" {
        Write-Green "Contexte Kubernetes :"
        kubectl config current-context
        Write-Host ""
        Write-Green "Namespace :"
        kubectl config view --minify --output 'jsonpath={..namespace}'
        Write-Host ""
    }
    
    "ci-test" {
        Write-Green "Exécution des tests backend..."
        Push-Location travel-todo
        python -m pytest
        Pop-Location
        Write-Green "Exécution des tests frontend..."
        Push-Location frontend/travelbook
        npm test -- --passWithNoTests
        Pop-Location
    }
    
    default {
        Write-Red "Commande inconnue: $Command"
        Write-Host "Tapez: .\make.ps1 help"
        exit 1
    }
}
