import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addComment, getPosts } from "../../actions/post.actions";
import FollowHandler from "../Profil/FollowHandler";
import { isEmpty, timestampParser } from "../Utils";
import EditDeleteComment from "./EditDeleteComment";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CardComments = ({ post }) => {
  const [text, setText] = useState("");
  const [showStripeButton, setShowStripeButton] = useState(false);
  const usersData = useSelector((state) => state.usersReducer);
  const userData = useSelector((state) => state.userReducer);
  const dispatch = useDispatch();

  // Stocke le compte précédent des commentaires
  const prevCommentsCountRef = useRef(post.comments.length);

  useEffect(() => {
    console.log("useEffect exécuté");
    console.log("post.comments.length :", post.comments.length);
    console.log("prevCommentsCountRef.current :", prevCommentsCountRef.current);

    // Vérifie si le nombre de commentaires a augmenté
    if (post.comments.length > prevCommentsCountRef.current) {
      console.log("La condition est vraie, on affiche le bouton");
      setShowStripeButton(true);
    }

    // Met à jour prevCommentsCountRef pour la prochaine comparaison
    prevCommentsCountRef.current = post.comments.length;
  }, [post.comments.length]);

  const handleComment = (e) => {
    e.preventDefault();

    if (text) {
      dispatch(addComment(post._id, userData._id, text, userData.pseudo))
        .then(() => dispatch(getPosts()))
        .then(() => {
          setText("");
          console.log("Commentaire posté");
        })
        .catch((err) => console.log(err));
    }
  };

  const handlePayment = async () => {
    const stripe = await stripePromise;

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}api/payment/create-checkout-session`,
        {
          postId: post._id,
          userId: userData._id,
        }
      );

      const session = response.data;

      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (result.error) {
        console.error(result.error.message);
      }
    } catch (err) {
      console.error("Erreur lors de la redirection vers le paiement :", err);
    }
  };

  return (
    <div className="comments-container">
      {/* Affichage des commentaires */}
      {post.comments.map((comment) => {
        return (
          <div
            className={
              comment.commenterId === userData._id
                ? "comment-container client"
                : "comment-container"
            }
            key={comment._id}
          >
            <div className="left-part">
              <img
                src={
                  !isEmpty(usersData[0]) &&
                  usersData
                    .map((user) => {
                      if (user._id === comment.commenterId) return user.picture;
                      else return null;
                    })
                    .join("")
                }
                alt="commenter-pic"
              />
            </div>
            <div className="right-part">
              <div className="comment-header">
                <div className="pseudo">
                  <h3>{comment.commenterPseudo}</h3>
                  {comment.commenterId !== userData._id && (
                    <FollowHandler
                      idToFollow={comment.commenterId}
                      type={"card"}
                    />
                  )}
                </div>
                <span>{timestampParser(comment.timestamp)}</span>
              </div>
              <p>{comment.text}</p>
              <EditDeleteComment comment={comment} postId={post._id} />
            </div>
          </div>
        );
      })}

      {userData._id && (
        <>
          <form action="" onSubmit={handleComment} className="comment-form">
            <input
              type="text"
              name="text"
              onChange={(e) => setText(e.target.value)}
              value={text}
              placeholder="Laisser un commentaire"
            />
            <br />
            <input type="submit" value="Envoyer" />
          </form>

          {showStripeButton && (
            <button onClick={handlePayment}>Payer avec Stripe</button>
          )}
        </>
      )}
    </div>
  );
};

export default CardComments;
