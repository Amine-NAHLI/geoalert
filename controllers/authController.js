// Importation du modèle User
const User = require('../models/User');

// Importation de la bibliothèque bcrypt pour le hachage des mots de passe
const bcrypt = require('bcryptjs');

// Importation du modèle Incident
const Incident = require('../models/Incident');

// Contrôleur pour afficher la page de connexion
exports.getLogin = (req, res) => {
    res.render('login', { title: 'Connexion' });
};

// Contrôleur pour afficher la page d'inscription
exports.getRegister = (req, res) => {
    res.render('register', { title: 'Inscription' });
};

// Contrôleur pour traiter la soumission du formulaire d'inscription
exports.postRegister = async (req, res) => {
    const { name, email, password } = req.body; // Récupération des données du formulaire
    try {
        const newUser = new User({ name, email, password }); // Création d'un nouvel utilisateur
        await newUser.save(); // Sauvegarde dans la base de données
        res.redirect('/auth/login'); // Redirection vers la page de connexion
    } catch (err) {
        console.error(err); // Affichage de l'erreur dans la console
        let errorMessage = "Erreur lors de l'inscription";
        if (err.code === 11000) errorMessage = "Cet email est déjà utilisé"; // Erreur d'unicité email
        res.render('register', { 
            title: 'Inscription',
            error: errorMessage // Affichage du message d'erreur
        });
    }
};

// Contrôleur pour traiter la soumission du formulaire de connexion
exports.postLogin = async (req, res) => {
    const { email, password } = req.body; // Récupération des données du formulaire
    try {
        const user = await User.findOne({ email }); // Recherche de l'utilisateur par email
        // Vérification de l'existence de l'utilisateur et de la validité du mot de passe
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.render('login', { 
                title: 'Connexion',
                error: "Email ou mot de passe incorrect" 
            });
        }
        req.session.user = user; // Stockage de l'utilisateur en session
        res.redirect('/auth/home'); // Redirection vers la page d'accueil
    } catch (err) {
        console.error(err); // Affichage de l'erreur serveur
        res.render('login', { 
            title: 'Connexion',
            error: "Erreur serveur" 
        });
    }
};

// Contrôleur pour afficher la page d'accueil avec la liste des incidents
exports.getHome = async (req, res) => {
    try {
        const incidents = await Incident.find({}); // Récupération de tous les incidents
        res.render('home', {
            title: 'Accueil',
            incidents,
            user: req.session.user // Envoi de l'utilisateur connecté à la vue
        });
    } catch (err) {
        console.error(err); // Erreur lors de la récupération
        res.status(500).render('500', { 
            title: 'Erreur serveur',
            error: err.message 
        });
    }
};

// Contrôleur pour la déconnexion de l'utilisateur
exports.logout = (req, res) => {
    req.session.destroy(err => { // Destruction de la session
        if (err) console.error(err);
        res.redirect('/auth/login'); // Redirection vers la page de connexion
    });
};

// Contrôleur pour ajouter un nouvel incident
exports.addIncident = async (req, res) => {
    const { type, lat, lng } = req.body; // Récupération des données du formulaire
    try {
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);
        // Validation des coordonnées
        if (isNaN(latitude)) throw new Error("Latitude invalide");
        if (isNaN(longitude)) throw new Error("Longitude invalide");
        if (latitude < -90 || latitude > 90) throw new Error("Latitude doit être entre -90 et 90");
        if (longitude < -180 || longitude > 180) throw new Error("Longitude doit être entre -180 et 180");
        
        // Création d'un nouvel incident
        const newIncident = new Incident({
            type,
            lat: latitude,
            lng: longitude,
            user: req.session.user._id
        });

        await newIncident.save(); // Sauvegarde dans la base de données
        
        // Envoi en temps réel via Socket.IO si disponible
        if (req.app.get('io')) {
            const io = req.app.get('io');
            io.emit('newIncident', newIncident); // Diffusion de l'incident aux clients
        }
        
        res.redirect('/auth/home'); // Redirection vers la page d'accueil
    } catch (err) {
        console.error("Erreur lors de l'ajout de l'incident:", err);
        res.status(500).render('500', { 
            title: 'Erreur serveur',
            error: err.message 
        });
    }
};

// Contrôleur pour récupérer tous les incidents en format JSON
exports.getIncidents = async (req, res) => {
    try {
        const incidents = await Incident.find({}); // Recherche de tous les incidents
        res.json(incidents); // Envoi au client en JSON
    } catch (err) {
        res.status(500).json({ error: "Erreur lors du chargement des incidents" }); // Erreur serveur
    }
};

// Contrôleur pour afficher la page d'accueil (landing page)
exports.getIndex = (req, res) => {
    res.render('index', { title: 'Accueil' }); // Rendu de la vue index
};
