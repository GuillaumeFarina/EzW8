const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
require('dotenv').config();

// Sérialisation de l'utilisateur dans la session
passport.serializeUser((user, done) => {
  done(null, user);
});

// Désérialisation de l'utilisateur depuis la session
passport.deserializeUser((user, done) => {
  done(null, user);
});

// Configuration de la stratégie Google OAuth
passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
  },
  (accessToken, refreshToken, profile, done) => {
    // vérifie l'utilisateur dans ma DB.
    // je renvoie simplement le profil.
    return done(null, profile);
  }
));

module.exports = passport;
