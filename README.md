# GeoAlert - Application de Trafic en Temps Réel

## 🌟 À propos

GeoAlert est une plateforme citoyenne de sécurité routière dédiée au Maroc. L'objectif est simple : connecter les conducteurs pour mieux anticiper les aléas du trafic. En quelques clics, les utilisateurs signalent des incidents et visualisent ceux des autres sur une carte interactive. Le système fonctionne en temps réel grâce à Socket.IO, pour que chaque alerte soit immédiatement partagée avec la communauté.

Cette application est conçue pour être intuitive et accessible, avec un parcours complet : inscription, authentification, géolocalisation automatique, ajout d'incidents et suivi en direct.

## 📋 Description du Projet

GeoAlert est une application web de type Waze développée pour le Maroc, permettant aux utilisateurs de signaler et visualiser des incidents de trafic en temps réel. L'application offre une interface cartographique interactive où les utilisateurs peuvent ajouter des incidents (accidents, bouchons, radars, travaux, dangers routiers) et voir les signalements des autres utilisateurs en temps réel.

## 👥 Auteurs

- **Kenza Boutarfass**
- **Amine Nahli**
- **Lina Oujdi**

## 🛠️ Technologies Utilisées

### Backend
- **Node.js** - Environnement d'exécution JavaScript côté serveur
- **Express.js** - Framework web pour Node.js
- **MongoDB** - Base de données NoSQL
- **Mongoose** - ODM (Object Data Modeling) pour MongoDB
- **Socket.IO** - Communication bidirectionnelle en temps réel
- **bcryptjs** - Hachage des mots de passe
- **express-session** - Gestion des sessions utilisateur
- **connect-mongo** - Stockage des sessions dans MongoDB

### Frontend
- **EJS** - Moteur de template pour générer du HTML
- **Leaflet** - Bibliothèque JavaScript pour cartes interactives
- **Vanilla JavaScript** - JavaScript natif pour les interactions
- **CSS3** - Styles et mise en page responsive

### Outils de Développement
- **Nodemon** - Redémarrage automatique du serveur en développement
- **dotenv** - Gestion des variables d'environnement

## 🚀 Fonctionnalités

### ✅ Authentification Utilisateur
- Inscription avec nom, email et mot de passe
- Connexion sécurisée avec hachage des mots de passe
- Gestion des sessions utilisateur
- Protection des routes sensibles

### ✅ Signalement d'Incidents
- 5 types d'incidents : Accident, Bouchon, Radar, Travaux, Danger routier
- Géolocalisation automatique via le navigateur
- Sélection manuelle sur la carte
- Validation des coordonnées GPS

### ✅ Visualisation Cartographique
- Carte interactive centrée sur le Maroc
- Affichage des incidents sous forme de cercles rouges
- Popups informatifs avec type et date de l'incident
- Marqueur de position utilisateur avec animation

### ✅ Temps Réel
- Mise à jour instantanée des nouveaux incidents via WebSocket
- Interface utilisateur synchronisée sans rechargement de page
- Notifications en temps réel des nouveaux signalements

### ✅ Interface Utilisateur
- Design responsive adapté mobile et desktop
- Interface intuitive avec sidebar et carte principale
- Liste des incidents récents
- Navigation fluide entre les pages

## 📁 Structure du Projet

```
GeoAlert Project/
├── controllers/
│   └── authController.js          # Logique métier pour l'authentification
├── middleware/
│   └── authMiddleware.js          # Middleware de protection des routes
├── models/
│   ├── User.js                    # Modèle utilisateur
│   └── Incident.js                # Modèle incident
├── public/
│   ├── script.js                  # JavaScript côté client
│   └── style.css                  # Styles CSS
├── routes/
│   └── auth.js                    # Routes d'authentification
├── views/
│   ├── index.ejs                  # Page d'accueil/landing
│   ├── login.ejs                  # Page de connexion
│   ├── register.ejs               # Page d'inscription
│   ├── home.ejs                   # Page principale avec carte
│   ├── 404.ejs                    # Page d'erreur 404
│   └── 500.ejs                    # Page d'erreur 500
├── .env.example                   # Exemple de configuration
├── package.json                   # Dépendances et scripts
├── server.js                      # Point d'entrée de l'application
└── README.md                      # Documentation du projet
```

## 🗄️ Modèle de Données

### Utilisateur (User)
```javascript
{
  name: String,           // Nom de l'utilisateur
  email: String,          // Email unique et requis
  password: String,       // Mot de passe haché
  // Timestamps automatiques via Mongoose
}
```

### Incident
```javascript
{
  type: String,           // Type d'incident (enum)
  lat: Number,            // Latitude (-90 à 90)
  lng: Number,            // Longitude (-180 à 180)
  user: ObjectId,         // Référence vers l'utilisateur
  createdAt: Date         // Date de création automatique
}
```

## 🔧 Installation et Configuration

### Prérequis
- **Node.js** (version 14 ou supérieure)
- **MongoDB** (local ou Atlas)
- **Navigateur moderne** avec support de la géolocalisation

### Étapes d'Installation

1. **Cloner le repository**
   ```bash
   git clone <url-du-repo>
   cd "GeoAlert Project"
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement**
   ```bash
   cp .env.example .env
   ```
   Modifier le fichier `.env` avec vos valeurs :
   ```env
   MONGO_URI=mongodb://localhost:27017/geoalert
   SESSION_SECRET=votre_cle_secrete_tres_longue_et_complexe
   PORT=5000
   NODE_ENV=development
   ```

4. **Démarrer MongoDB**
   Assurez-vous que MongoDB est en cours d'exécution sur votre système.

5. **Lancer l'application**
   ```bash
   # Mode développement (avec nodemon)
   npm run dev

   # Mode production
   npm start
   ```

6. **Accéder à l'application**
   Ouvrez votre navigateur à l'adresse : `http://localhost:5000`

## 🌐 API Endpoints

### Routes d'Authentification (`/auth`)
- `GET /auth/login` - Page de connexion
- `POST /auth/login` - Traitement de la connexion
- `GET /auth/register` - Page d'inscription
- `POST /auth/register` - Traitement de l'inscription
- `GET /auth/home` - Page principale (protégée)
- `POST /auth/add-incident` - Ajout d'un incident (protégé)
- `GET /auth/api/incidents` - Récupération des incidents (JSON)
- `GET /auth/logout` - Déconnexion

### Route Principale
- `GET /` - Page d'accueil

## 🔒 Sécurité

- **Hachage des mots de passe** avec bcryptjs
- **Protection CSRF** implicite via sessions
- **Validation des entrées** côté serveur
- **Sessions sécurisées** stockées dans MongoDB
- **Variables d'environnement** pour les secrets
- **Middleware d'authentification** pour les routes sensibles

## 📱 Fonctionnalités Techniques

### Géolocalisation
- Support de l'API Geolocation du navigateur
- Géolocalisation haute précision
- Gestion des erreurs de géolocalisation
- Marqueur animé pour la position utilisateur

### Communication Temps Réel
- WebSocket via Socket.IO
- Diffusion instantanée des nouveaux incidents
- Mise à jour de l'interface sans rechargement

### Cartographie
- Bibliothèque Leaflet pour cartes interactives
- Tuiles OpenStreetMap
- Cercles pour représenter les incidents
- Popups informatifs
- Gestion des clics sur la carte

## 🎨 Interface Utilisateur

### Pages Principales
- **Accueil** (`/`) : Landing page avec liens vers connexion/inscription
- **Connexion** (`/auth/login`) : Formulaire de connexion
- **Inscription** (`/auth/register`) : Formulaire d'inscription
- **Application** (`/auth/home`) : Interface principale avec carte et sidebar

### Design
- **Responsive** : Adapté mobile et desktop
- **Thème Marocain** : Couleurs inspirées du drapeau marocain
- **UX Intuitive** : Navigation simple et claire
- **Animations** : Marqueur utilisateur avec effet de pulsation

## 🚀 Déploiement

### Variables d'Environnement pour Production
```env
NODE_ENV=production
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/geoalert
SESSION_SECRET=votre_cle_secrete_prod
PORT=5000
```

### Build et Déploiement
```bash
# Installation des dépendances de production
npm ci --only=production

# Démarrage en production
npm start
```

### Services de Déploiement Recommandés
- **Heroku** - Déploiement facile avec buildpacks Node.js
- **Vercel** - Pour le frontend statique si séparé
- **MongoDB Atlas** - Base de données cloud
- **Railway** ou **Render** - Alternatives modernes

## 🐛 Dépannage

### Erreurs Courantes

1. **Erreur de connexion MongoDB**
   - Vérifier que MongoDB est démarré
   - Contrôler la chaîne de connexion dans `.env`

2. **Erreur de géolocalisation**
   - Vérifier les permissions du navigateur
   - Tester sur HTTPS en production

3. **Socket.IO ne fonctionne pas**
   - Vérifier les CORS
   - Contrôler les logs du serveur

### Logs et Debugging
```bash
# Logs du serveur
npm run dev

# Vérification des variables d'environnement
node -e "console.log(require('dotenv').config())"
```

## 📈 Améliorations Futures

- [ ] **Notifications push** pour nouveaux incidents proches
- [ ] **Filtrage des incidents** par type et distance
- [ ] **Système de notation** pour la fiabilité des signalements
- [ ] **API mobile** pour applications natives
- [ ] **Intégration avec Google Maps** ou Mapbox
- [ ] **Système de modération** pour les administrateurs
- [ ] **Historique des incidents** avec archivage
- [ ] **Statistiques** sur les incidents par région

## 📄 Licence

ISC License - Voir le fichier `package.json` pour plus de détails.

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📞 Support

Pour toute question ou problème, contactez les auteurs du projet :
- Kenza Boutarfass--boutarfasskenza@gmail.com
- Amine Nahli--nahli-ami@upf.ac.ma   
- Lina Oujdi--oujdilina@gmail.com

---

**GeoAlert** - Solution innovante pour un trafic plus fluide au Maroc ! 🇲🇦