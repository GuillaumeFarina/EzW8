const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const userRoutes = require('./routes/user.routes');
const postRoutes = require('./routes/post.routes');
const paymentRoutes = require('./routes/payment.routes');
require('./config/passport');
require('dotenv').config({ path: './config/.env' });
require('./config/db');
const { checkUser, requireAuth } = require('./middleware/auth.middleware');
const cors = require('cors');
const passport = require('passport');
const authRoutes = require('./routes/auth.route.js');

const app = express();

// Configuration des options CORS
const corsOptions = {
  origin: process.env.CLIENT_URL,
  credentials: true,
  allowedHeaders: ['sessionId', 'Content-Type'],
  exposedHeaders: ['sessionId'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
};

app.use(cors(corsOptions));

// Middleware pour parser les requêtes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: "une_cle_secrete_très_forte", // changer la clé plus tard
    resave: false,
    saveUninitialized: true
  })
);
app.use(passport.initialize());
app.use(passport.session());

// jwt
app.use(checkUser); // Applique le middleware à toutes les routes

// Routes
app.get('/jwtid', requireAuth, (req, res) => {
  res.status(200).send(res.locals.user._id);
});

// Route par défaut pour check l'état d'authentification
app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    res.send(`Bienvenue ${req.user.displayName}`);
  } else {
    res.send('Non authentifié. <a href="/auth/google">Se connecter avec Google</a>');
  }
});

// Utilise les routes d'authentification pour tout ce qui commence par '/auth'
app.use('/auth', authRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/user', userRoutes);
app.use('/api/post', postRoutes);

// Démarrage du serveur
const PORT = process.env.PORT || 5000; // Défaut au port 5000 si non spécifié
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
