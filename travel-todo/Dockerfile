# Utiliser une image Python légère
FROM python:3.11-slim

# Empêcher Python d'écrire des fichiers .pyc et activer les logs en direct
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Définir le dossier de travail dans le conteneur
WORKDIR /app

# Copier les fichiers de dépendances
COPY requirements.txt /app/

# Installer les dépendances
RUN pip install --no-cache-dir -r requirements.txt

# Copier tout le reste du code
COPY . /app/

# Exposer le port 8000
EXPOSE 8000

# La commande pour lancer le serveur
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
