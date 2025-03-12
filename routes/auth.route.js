const express = require('express');
const passport = require('passport');
const router = express.Router();

// Route pour initier l'authentification Google
router.get('/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Callback après authentification
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Authentification réussie, redirige vers front-end
    res.redirect('http://localhost:3001');
  }
);

module.exports = router;
