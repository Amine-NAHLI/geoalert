// routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { ensureAuthenticated } = require('../middleware/authMiddleware');

// Routes GET
router.get('/login', authController.getLogin);
router.get('/register', authController.getRegister);
router.get('/home', ensureAuthenticated, authController.getHome);
router.get('/logout', ensureAuthenticated, authController.logout);

// Routes POST
router.post('/register', authController.postRegister);
router.post('/login', authController.postLogin);
router.post('/add-incident', ensureAuthenticated, authController.addIncident);

// Route API
router.get('/api/incidents', authController.getIncidents);

module.exports = router;