# Makefile pour Travel App DevOps
# Usage: make <target>

.PHONY: help build deploy clean logs scale test

# Variables
BACKEND_IMAGE = travel-backend:latest
FRONTEND_IMAGE = travel-frontend:latest

# Couleurs pour l'affichage
GREEN = \033[0;32m
YELLOW = \033[0;33m
RED = \033[0;31m
NC = \033[0m # No Color

help: ## Afficher l'aide
	@echo "$(GREEN)Travel App DevOps - Commandes Disponibles$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-20s$(NC) %s\n", $$1, $$2}'

# ============================================
# DOCKER
# ============================================

build: ## Construire les images Docker
	@echo "$(GREEN)Construction des images Docker...$(NC)"
	docker build -t $(BACKEND_IMAGE) ./travel-todo
	docker build -t $(FRONTEND_IMAGE) ./frontend/travelbook
	@echo "$(GREEN)✓ Images construites avec succès$(NC)"

build-backend: ## Construire uniquement l'image backend
	@echo "$(GREEN)Construction de l'image backend...$(NC)"
	docker build -t $(BACKEND_IMAGE) ./travel-todo

build-frontend: ## Construire uniquement l'image frontend
	@echo "$(GREEN)Construction de l'image frontend...$(NC)"
	docker build -t $(FRONTEND_IMAGE) ./frontend/travelbook

docker-up: ## Lancer avec Docker Compose
	@echo "$(GREEN)Lancement avec Docker Compose...$(NC)"
	docker-compose up -d
	@echo "$(GREEN)✓ Services démarrés$(NC)"

docker-down: ## Arrêter Docker Compose
	@echo "$(YELLOW)Arrêt de Docker Compose...$(NC)"
	docker-compose down

docker-logs: ## Voir les logs Docker Compose
	docker-compose logs -f

# ============================================
# KUBERNETES
# ============================================

deploy: build ## Déployer sur Kubernetes (après build)
	@echo "$(GREEN)Déploiement sur Kubernetes...$(NC)"
	kubectl apply -f k8s/configmap.yaml
	kubectl apply -f k8s/secrets.yaml
	kubectl apply -f k8s/database-statefulset.yaml
	kubectl apply -f k8s/backend.yaml
	kubectl apply -f k8s/frontend.yaml
	kubectl apply -f k8s/monitoring/
	@echo "$(GREEN)✓ Déploiement terminé$(NC)"

deploy-config: ## Déployer uniquement ConfigMap et Secrets
	kubectl apply -f k8s/configmap.yaml
	kubectl apply -f k8s/secrets.yaml

deploy-db: ## Déployer uniquement la base de données
	kubectl apply -f k8s/database-statefulset.yaml

deploy-backend: ## Déployer uniquement le backend
	kubectl apply -f k8s/backend.yaml

deploy-frontend: ## Déployer uniquement le frontend
	kubectl apply -f k8s/frontend.yaml

deploy-monitoring: ## Déployer uniquement le monitoring
	kubectl apply -f k8s/monitoring/

status: ## Voir le statut des ressources Kubernetes
	@echo "$(GREEN)=== Pods ===$(NC)"
	kubectl get pods
	@echo ""
	@echo "$(GREEN)=== Services ===$(NC)"
	kubectl get services
	@echo ""
	@echo "$(GREEN)=== Deployments ===$(NC)"
	kubectl get deployments

pods: ## Lister les pods
	kubectl get pods -o wide

services: ## Lister les services
	kubectl get services

all: ## Voir toutes les ressources
	kubectl get all

# ============================================
# LOGS & DEBUG
# ============================================

logs-backend: ## Voir les logs du backend
	kubectl logs -l app=travel-backend --tail=100 -f

logs-frontend: ## Voir les logs du frontend
	kubectl logs -l app=travel-frontend --tail=100 -f

logs-db: ## Voir les logs de la base de données
	kubectl logs postgres-0 --tail=100 -f

logs-prometheus: ## Voir les logs de Prometheus
	kubectl logs -l app=prometheus --tail=100 -f

logs-grafana: ## Voir les logs de Grafana
	kubectl logs -l app=grafana --tail=100 -f

describe-backend: ## Décrire un pod backend
	@POD=$$(kubectl get pods -l app=travel-backend -o jsonpath='{.items[0].metadata.name}'); \
	kubectl describe pod $$POD

describe-frontend: ## Décrire un pod frontend
	@POD=$$(kubectl get pods -l app=travel-frontend -o jsonpath='{.items[0].metadata.name}'); \
	kubectl describe pod $$POD

events: ## Voir les événements récents
	kubectl get events --sort-by=.metadata.creationTimestamp

# ============================================
# SCALING
# ============================================

scale-backend: ## Scaler le backend (usage: make scale-backend REPLICAS=5)
	@REPLICAS=$${REPLICAS:-3}; \
	echo "$(GREEN)Scaling backend à $$REPLICAS replicas...$(NC)"; \
	kubectl scale deployment travel-backend --replicas=$$REPLICAS

scale-frontend: ## Scaler le frontend (usage: make scale-frontend REPLICAS=5)
	@REPLICAS=$${REPLICAS:-3}; \
	echo "$(GREEN)Scaling frontend à $$REPLICAS replicas...$(NC)"; \
	kubectl scale deployment travel-frontend --replicas=$$REPLICAS

# ============================================
# PORT FORWARDING
# ============================================

port-backend: ## Port-forward backend (localhost:8000)
	@echo "$(GREEN)Backend accessible sur http://localhost:8000$(NC)"
	kubectl port-forward service/travel-backend-service 8000:8000

port-frontend: ## Port-forward frontend (localhost:3000)
	@echo "$(GREEN)Frontend accessible sur http://localhost:3000$(NC)"
	kubectl port-forward service/travel-frontend-service 3000:3000

port-prometheus: ## Port-forward Prometheus (localhost:9090)
	@echo "$(GREEN)Prometheus accessible sur http://localhost:9090$(NC)"
	kubectl port-forward service/prometheus-service 9090:9090

port-grafana: ## Port-forward Grafana (localhost:3100)
	@echo "$(GREEN)Grafana accessible sur http://localhost:3100 (admin/admin)$(NC)"
	kubectl port-forward service/grafana-service 3100:3000

# ============================================
# RESTART & ROLLOUT
# ============================================

restart-backend: ## Redémarrer le backend
	@echo "$(YELLOW)Redémarrage du backend...$(NC)"
	kubectl rollout restart deployment/travel-backend
	kubectl rollout status deployment/travel-backend

restart-frontend: ## Redémarrer le frontend
	@echo "$(YELLOW)Redémarrage du frontend...$(NC)"
	kubectl rollout restart deployment/travel-frontend
	kubectl rollout status deployment/travel-frontend

rollback-backend: ## Rollback du backend
	@echo "$(RED)Rollback du backend...$(NC)"
	kubectl rollout undo deployment/travel-backend

rollback-frontend: ## Rollback du frontend
	@echo "$(RED)Rollback du frontend...$(NC)"
	kubectl rollout undo deployment/travel-frontend

# ============================================
# TESTS & DEMO
# ============================================

test-autoheal: ## Tester l'auto-healing (supprime un pod backend)
	@echo "$(YELLOW)Test de l'auto-healing...$(NC)"
	@POD=$$(kubectl get pods -l app=travel-backend -o jsonpath='{.items[0].metadata.name}'); \
	echo "Suppression du pod $$POD..."; \
	kubectl delete pod $$POD; \
	echo "$(GREEN)Vérifiez que le pod est recréé automatiquement :$(NC)"; \
	kubectl get pods -w

demo: ## Lancer une démonstration complète
	@echo "$(GREEN)=== DÉMONSTRATION DEVOPS ===$(NC)"
	@echo ""
	@echo "$(YELLOW)1. Construction des images...$(NC)"
	@make build
	@echo ""
	@echo "$(YELLOW)2. Déploiement sur Kubernetes...$(NC)"
	@make deploy
	@echo ""
	@echo "$(YELLOW)3. Attente du démarrage des pods...$(NC)"
	@sleep 10
	@echo ""
	@echo "$(YELLOW)4. Statut des ressources :$(NC)"
	@make status
	@echo ""
	@echo "$(GREEN)✓ Démonstration prête !$(NC)"
	@echo ""
	@echo "Accès aux services :"
	@echo "  - Backend:    make port-backend"
	@echo "  - Frontend:   make port-frontend"
	@echo "  - Prometheus: make port-prometheus"
	@echo "  - Grafana:    make port-grafana"

# ============================================
# CLEANUP
# ============================================

clean: ## Supprimer tous les déploiements Kubernetes
	@echo "$(RED)Suppression des déploiements...$(NC)"
	kubectl delete -f k8s/ --ignore-not-found=true
	kubectl delete -f k8s/monitoring/ --ignore-not-found=true
	@echo "$(GREEN)✓ Nettoyage terminé$(NC)"

clean-all: clean ## Supprimer tout (Kubernetes + Docker)
	@echo "$(RED)Suppression des images Docker...$(NC)"
	docker rmi $(BACKEND_IMAGE) $(FRONTEND_IMAGE) --force || true
	@echo "$(GREEN)✓ Nettoyage complet terminé$(NC)"

# ============================================
# MONITORING
# ============================================

top: ## Voir l'utilisation des ressources
	@echo "$(GREEN)=== Utilisation des Pods ===$(NC)"
	kubectl top pods
	@echo ""
	@echo "$(GREEN)=== Utilisation des Nodes ===$(NC)"
	kubectl top nodes

metrics: ## Voir les métriques détaillées
	@echo "$(GREEN)=== Métriques des Pods ===$(NC)"
	kubectl get pods -o custom-columns=NAME:.metadata.name,CPU:.spec.containers[*].resources.requests.cpu,MEMORY:.spec.containers[*].resources.requests.memory

# ============================================
# UTILITAIRES
# ============================================

shell-backend: ## Ouvrir un shell dans un pod backend
	@POD=$$(kubectl get pods -l app=travel-backend -o jsonpath='{.items[0].metadata.name}'); \
	echo "$(GREEN)Connexion au pod $$POD...$(NC)"; \
	kubectl exec -it $$POD -- bash

shell-frontend: ## Ouvrir un shell dans un pod frontend
	@POD=$$(kubectl get pods -l app=travel-frontend -o jsonpath='{.items[0].metadata.name}'); \
	echo "$(GREEN)Connexion au pod $$POD...$(NC)"; \
	kubectl exec -it $$POD -- sh

shell-db: ## Ouvrir un shell dans le pod PostgreSQL
	@echo "$(GREEN)Connexion à PostgreSQL...$(NC)"
	kubectl exec -it postgres-0 -- psql -U postgres -d travel_todo_db

watch: ## Surveiller les pods en temps réel
	kubectl get pods -w

context: ## Afficher le contexte Kubernetes actuel
	@echo "$(GREEN)Contexte Kubernetes :$(NC)"
	kubectl config current-context
	@echo ""
	@echo "$(GREEN)Namespace :$(NC)"
	kubectl config view --minify --output 'jsonpath={..namespace}'
	@echo ""

# ============================================
# CI/CD
# ============================================

ci-test: ## Exécuter les tests (comme dans le CI)
	@echo "$(GREEN)Exécution des tests backend...$(NC)"
	cd travel-todo && python -m pytest
	@echo "$(GREEN)Exécution des tests frontend...$(NC)"
	cd frontend/travelbook && npm test -- --passWithNoTests

# Par défaut, afficher l'aide
.DEFAULT_GOAL := help
