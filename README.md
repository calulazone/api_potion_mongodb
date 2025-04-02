# API Potions - GIRARD Lucas ESGI M1

Ce projet est une API pour gérer des potions, construite avec Node.js, Express et MongoDB.  
Elle inclut des fonctionnalités d'authentification, de gestion des utilisateurs et des potions, ainsi que des analyses statistiques.

---

## Prérequis

- Node.js (version 16 ou supérieure)
- MongoDB (instance locale ou distante)

---

## Installation

1. Clonez le dépôt :
```bash
   git clone https://github.com/calulazone/api_potion_mongodb.git
   cd api_potion_mongodb
```

3. Installez les dépendances :
```bash
   npm install
```

5. Configurez les variables d'environnement :
   - Créez un fichier .env à la racine du projet.
   - Ajoutez les variables suivantes :
     ```bash
     PORT=3000
     MONGO_URI=<votre_url_mongodb>
     SECRET=<votre_secret_jwt>
     COOKIE_NAME=demo_node+mongo_token
     ```
---

## Démarrage

- En mode production :
```bash
  npm start
```

- En mode développement (avec rechargement automatique grâce à nodemon) :
```bash
  npm run dev
```
---

## Documentation API

La documentation Swagger est disponible une fois le serveur démarré à l'adresse suivante :  
```bash
http://localhost:3000/api-docs
```
---

## Fonctionnalités principales

- Authentification (inscription, connexion, déconnexion)
- Gestion des potions (CRUD)
- Analyses statistiques sur les potions

---

## Dépendances principales

- express → Framework web pour Node.js  
- mongoose → ODM pour MongoDB  
- jsonwebtoken → Gestion des tokens JWT  
- bcryptjs → Hashage des mots de passe  
- swagger-jsdoc et swagger-ui-express → Documentation API  

---

## Licence

Ce projet est sous licence ISC.
