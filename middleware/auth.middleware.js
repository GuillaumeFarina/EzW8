const jwt = require("jsonwebtoken");
const UserModel = require("../models/user.model");

module.exports.checkUser = async (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    try {
      const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
      const user = await UserModel.findById(decodedToken.id);
      res.locals.user = user;
      next();
    } catch (err) {
      console.error('Erreur lors de la vérification du token :', err);
      res.locals.user = null;
      // efface le cookie
      // res.cookie("jwt", "", { maxAge: 1 });
      next();
    }
  } else {
    res.locals.user = null;
    next();
  }
};

module.exports.requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    try {
      const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
      console.log('ID utilisateur authentifié :', decodedToken.id);
      next();
    } catch (err) {
      console.error('Erreur lors de la vérification du token :', err);
      res.status(401).json('Accès non autorisé');
    }
  } else {
    console.log('Aucun token fourni');
    res.status(401).json('Accès non autorisé');
  }
};
