// Importation du framework Express
const express = require('express');


const session = require('express-session');

// Librairie pour se connecter à MongoDB
const mongoose = require('mongoose');

// Module pour gérer les chemins de fichiers
const path = require('path');

// Module HTTP de Node.js
const http = require('http');

// Bibliothèque pour gérer WebSocket avec Socket.IO
const socketIo = require('socket.io');

// Stockage des sessions dans MongoDB
const MongoStore = require('connect-mongo');

// Chargement des variables d'environnement depuis le fichier .env
require('dotenv').config();

// Création de l'application Express
const app = express();
app.set('trust proxy', 1);


// Création d'un serveur HTTP avec Express
const server = http.createServer(app);

// Initialisation de Socket.IO sur le serveur
const io = socketIo(server);

// Stockage de l'instance de socket.io dans l'application pour y accéder ailleurs
app.set('io', io);

// Connexion à MongoDB avec les options de compatibilité
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
// Message si la connexion est réussie
.then(() => console.log('✅ Connecté à MongoDB avec succès'))
// Message et arrêt si la connexion échoue
.catch(err => {
  console.error('❌ Erreur de connexion à MongoDB:', err.message);
  process.exit(1);
});

// Configuration du middleware de session avec stockage dans MongoDB
app.use(session({
  secret: process.env.SESSION_SECRET, // Clé secrète pour signer les cookies
  resave: false, // Ne pas sauvegarder la session si elle n'a pas été modifiée
  saveUninitialized: false, // Sauvegarder les sessions même non initialisées
  store: MongoStore.create({ 
    mongoUrl: process.env.MONGO_URI, // Lien vers MongoDB
    ttl: 24 * 60 * 60 // Durée de vie de la session en secondes (1 jour)
  }),
  cookie: { 
    secure: process.env.NODE_ENV === 'production', // Utiliser HTTPS en production
    maxAge: 1000 * 60 * 60 * 24 // Expiration du cookie après 1 jour
  }
}));

// Middleware pour parser les données JSON
app.use(express.json());

// Middleware pour parser les données encodées (formulaires)
app.use(express.urlencoded({ extended: true }));

// Définition du moteur de rendu des vues comme étant EJS
app.set('view engine', 'ejs');

// Spécification du dossier contenant les vues
app.set('views', path.join(__dirname, 'views'));

// Définition du dossier public contenant les fichiers statiques (CSS, JS, images...)
app.use(express.static(path.join(__dirname, 'public')));

// Importation des routes d'authentification
const authRoutes = require('./routes/auth');

// Utilisation des routes d'authentification avec préfixe /auth
app.use('/auth', authRoutes);

// Route principale de la page d'accueil
app.get('/', (req, res) => {
  res.render('index', { title: 'Accueil' });
});

// Middleware pour gérer les pages non trouvées (404)
app.use((req, res) => {
  res.status(404).render('404', { title: 'Page non trouvée' });
});

// Middleware de gestion des erreurs serveur (500)
app.use((err, req, res, next) => {
  console.error(err.stack); // Affichage de l'erreur complète
  res.status(500).render('500', { 
    title: 'Erreur serveur',
    error: err.message 
  });
});

// Écoute des connexions Socket.IO
io.on('connection', (socket) => {
  console.log('🔌 Nouveau client connecté');
  socket.on('disconnect', () => {
    console.log('❌ Client déconnecté');
  });
});

// Définition du port et démarrage du serveur
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});
