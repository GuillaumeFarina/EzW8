const express = require('express');
const router = express.Router();
require('dotenv').config({ path: './config/.env' });
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Post = require('../models/post.model');
const User = require('../models/user.model');

router.post('/create-checkout-session', async (req, res) => {
  try {
    const { postId, userId } = req.body;

    // Vérifie que postId et userId sont fournis
    if (!postId || !userId) {
      return res.status(400).json({ error: 'postId et userId sont requis' });
    }

    // Récupérer le post
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post non trouvé' });
    }

    // Récupérer l'utilisateur qui effectue le paiement (le payeur)
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Récupérer l'auteur du post (celui qui recevra le paiement)
    const poster = await User.findById(post.posterId);
    if (!poster) {
      return res.status(404).json({ error: 'Auteur du post non trouvé' });
    }

    // Logger les informations pour vérification
    console.log('Post récupéré :', post);
    console.log('Utilisateur payeur :', user);
    console.log('Auteur du post :', poster);

    // Formater la date si c'est disponible
    const formattedDate = post.date ? new Date(post.date).toLocaleDateString() : 'Non spécifiée';

    // Créer la session de paiement en utilisant les informations combinées
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: post.title || `Post ${postId}`, // Utilise le titre du post
            description: `Poste créer par : ${poster.pseudo || 'Utilisateur inconnu'}\nLieu : ${post.location || 'Non spécifié'}\nDate : ${formattedDate},\nPaiement effectuer par : ${user.pseudo || 'Utilisateur inconnu'}`,
          },
          unit_amount: 100,
        },
        quantity: 1,
      }],
      mode: 'payment',
      customer_email: user.email || undefined,
      success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
      metadata: {
        postTitle: post.title || '',
        payerUsername: user.pseudo || '',
        receiverUsername: poster.pseudo || '',
        postId: postId,
        payerId: userId,
        receiverId: post.posterId || '',
      },
    });

    // Envoyer l'ID de la session au client
    res.json({ id: session.id });
  } catch (error) {
    console.error('Erreur lors de la création de la session de paiement :', error);
    res.status(500).json({ error: 'Une erreur est survenue lors de la création de la session de paiement.' });
  }
});

module.exports = router;
