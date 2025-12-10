# Étape 1 : Construction de l'app React
FROM node:18-alpine as build

WORKDIR /app

# Copier les fichiers de dépendances
COPY package.json package-lock.json ./

# Installer les dépendances (utiliser npm ci pour builds reproductibles)
RUN npm ci --only=production

# Copier le code source
COPY . .

# Construire la version de production
RUN npm run build

# Étape 2 : Servir avec Nginx
FROM nginx:alpine

# Copier la configuration Nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copier les fichiers construits depuis l'étape 1 vers le dossier de Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Créer un utilisateur non-root pour plus de sécurité
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Exposer le port 80
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

# Lancer Nginx
CMD ["nginx", "-g", "daemon off;"]

