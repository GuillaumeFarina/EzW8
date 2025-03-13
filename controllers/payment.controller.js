require('dotenv').config({ path: './config/.env' });
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Post = require('../models/post.model');
const User = require('../models/user.model');

const createCheckoutSession = async (req, res) => {
  try {
    const { postId, userId } = req.body;

    // Valide la présence de postId et userId
    if (!postId || !userId) {
      return res.status(400).json({ error: 'postId et userId sont requis' });
    }

    // Trouve le post
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post non trouvé' });
    }

    // Trouve l'utilisateur qui paye
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Trouve l'auteur du post
    const poster = await User.findById(post.posterId);
    if (!poster) {
      return res.status(404).json({ error: 'Auteur du post non trouvé' });
    }

    // Logging pour check
    console.log('Post récupéré :', post);
    console.log('Utilisateur payeur :', user);
    console.log('Auteur du post :', poster);

    // Formater la date si possible
    const formattedDate = post.date
      ? new Date(post.date).toLocaleDateString()
      : 'Non spécifiée';

    // Session de paiement (Stripe)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: post.title || `Post ${postId}`,
            description: `Post créé par : ${poster.pseudo || 'Utilisateur inconnu'}\n` +
                         `Lieu : ${post.location || 'Non spécifié'}\n` +
                         `Date : ${formattedDate},\n` +
                         `Paiement effectué par : ${user.pseudo || 'Utilisateur inconnu'}`,
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

    // Envoye l'ID de la session au client
    return res.json({ id: session.id });
  } catch (error) {
    console.error('Erreur lors de la création de la session de paiement :', error);
    return res.status(500).json({
      error: 'Une erreur est survenue lors de la création de la session de paiement.'
    });
  }
};

module.exports = {
  createCheckoutSession,
};
