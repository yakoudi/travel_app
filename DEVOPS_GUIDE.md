# Guide DevOps Complet : Architecture Docker & Kubernetes

Ce document détaille l'architecture DevOps mise en place pour le projet **Travel App**. Il explique étape par étape ce qui a été fait, pourquoi cela a été fait (avec des analogies simples), et comment manipuler l'infrastructure.

---

## 1. La Conteneurisation (Docker)

### C'est quoi ? (L'analogie IKEA)
Imagine que ton application est un meuble en kit.
*   **Sans Docker** : Tu donnes le plan de montage à un ami, mais il n'a pas les mêmes outils que toi (pas la même version de Python, pas les mêmes librairies). Résultat : Le meuble est bancal ou ne se monte pas ("Ça marche chez moi mais pas chez toi").
*   **Avec Docker** : Tu donnes une "boîte magique" qui contient le meuble **DÉJÀ monté** et tous les outils nécessaires. Ton ami a juste à ouvrir la boîte et l'utiliser.

### Ce qu'on a fait techniquement :
1.  **Backend (`travel-todo/Dockerfile`)** :
    *   C'est la recette de cuisine. Elle dit : "Prends Python 3.11, installe Django, copie le code".
    *   L'**Image** créée est le gâteau cuit.
    *   Le **Conteneur** est l'application qui tourne.
2.  **Frontend (`frontend/travelbook/Dockerfile`)** :
    *   Utilise une méthode "Multi-stage" : d'abord on utilise Node.js pour construire le site, puis on utilise Nginx (un serveur web très rapide) pour le distribuer.

---

## 2. L'Orchestration (Kubernetes / K8s)

### C'est quoi ? (Le Chef d'Orchestre)
Avoir des conteneurs, c'est bien. Mais si tu en as 50, c'est le chaos.
*   **Le problème** : Si un conteneur plante (crash), qui le redémarre ? Si 1000 personnes arrivent sur le site, comment on gère ?
*   **La solution** : Kubernetes est le **Chef d'Orchestre**. Tu lui donnes la partition (les fichiers `.yaml`) et il s'assure que la musique joue toujours parfaitement.

### Ce qu'on a fait techniquement (Dossier `k8s/`) :
1.  **Deployments (`Deployment`)** :
    *   On dit au chef : "Je veux toujours **1 copie** de mon Backend en vie".
    *   Si le Backend plante, Kubernetes le voit et le remplace immédiatement par un neuf (Self-healing).
2.  **Services (`Service`)** :
    *   C'est le standardiste. Il permet au Frontend de trouver le Backend juste en l'appelant par son nom (`travel-backend`), sans se soucier des adresses IP compliquées.

---

## 3. Le Monitoring (Prometheus & Grafana)

### C'est quoi ? (Le Tableau de Bord)
Une fois que tout tourne, tu es aveugle. Tu ne sais pas si ton serveur souffre ou s'il est lent.
C'est comme conduire une voiture sans tableau de bord : tu ne sais pas à quelle vitesse tu vas ni s'il reste de l'essence.

### Ce qu'on a fait techniquement (Dossier `k8s/monitoring/`) :
1.  **Prometheus (Le Collecteur)** :
    *   C'est un robot qui passe toutes les 15 secondes voir ton application et note tout dans un carnet : "Combien de mémoire utilisée ? Combien de requêtes reçues ?".
    *   Accessible sur : `http://localhost:9090`
2.  **Grafana (Le Visualisateur)** :
    *   C'est l'écran télé. Il lit le carnet de Prometheus et dessine des jolis graphiques (courbes, camemberts) pour que tu puisses comprendre l'état de santé de ton app d'un seul coup d'œil.
    *   Accessible sur : `http://localhost:3100` (Login: `admin` / `admin`).

---

## 4. Aide-mémoire des Commandes (Cheat Sheet)

Voici les commandes essentielles pour gérer ton projet DevOps au quotidien.

### Démarrer le projet (Tout lancer)
```powershell
# 1. Lancer les applications (Backend + Frontend)
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml

# 2. Lancer le monitoring (Prometheus + Grafana)
kubectl apply -f k8s/monitoring/prometheus.yaml
kubectl apply -f k8s/monitoring/grafana.yaml
```

### Vérifier l'état
```powershell
# Voir les Pods (les applications qui tournent)
kubectl get pods

# Voir les Services (les ports ouverts)
kubectl get services
```

### Mettre à jour une application
Si tu modifies le code (ex: backend), tu dois :
1.  Reconstruire l'image Docker : `docker build -t travel-backend .`
2.  Redémarrer le Pod Kubernetes : `kubectl rollout restart deployment/travel-backend`

### Tout arrêter (Nettoyage)
```powershell
kubectl delete -f k8s/
kubectl delete -f k8s/monitoring/
```
