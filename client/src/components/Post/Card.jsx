import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { dateParser, isEmpty } from "../Utils";
import FollowHandler from "../Profil/FollowHandler";
import LikeButton from "./LikeButton";
import { updatePost } from "../../actions/post.actions";
import DeleteCard from "./DeleteCard";
import CardComments from "./CardComments";

const Card = ({ post }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdated, setIsUpdated] = useState(false);
  const [textUpdate, setTextUpdate] = useState(post.message);
  const [showComments, setShowComments] = useState(true);
  const usersData = useSelector((state) => state.usersReducer);
  const userData = useSelector((state) => state.userReducer);
  const dispatch = useDispatch();

  const updateItem = () => {
    if (textUpdate && textUpdate !== post.message) {
      dispatch(updatePost(post._id, textUpdate));
    }
    setIsUpdated(false);
  };

  useEffect(() => {
    if (!isEmpty(usersData)) setIsLoading(false);
  }, [usersData]);

  // Fonction pour récupérer les données de l'utilisateur qui a posté
  const posterData = !isEmpty(usersData)
    ? usersData.find((user) => user._id === post.posterId)
    : null;

  // Fonction de partage
  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `Post de ${posterData ? posterData.pseudo : "un utilisateur"}`,
          text: post.message,
          url: window.location.href,
        })
        .then(() => console.log("Partage réussi !"))
        .catch((error) => console.error("Erreur lors du partage", error));
    } else {
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => {
          alert(
            "Le lien du post a été copié dans le presse-papiers. Partagez-le où vous voulez !"
          );
        })
        .catch((error) => {
          console.error("Erreur lors de la copie du lien", error);
        });
    }
  };

  return (
    <li className="card-container" key={post._id}>
      {isLoading ? (
        <i className="fas fa-spinner fa-spin"></i>
      ) : (
        <>
          <div className="card-left">
            <img
              src={posterData ? posterData.picture : "./img/random-user.png"}
              alt="poster-pic"
            />
          </div>
          <div className="card-right">
            <div className="card-header">
              <div className="pseudo">
                <h3>{posterData ? posterData.pseudo : "Utilisateur inconnu"}</h3>
                {post.posterId !== userData._id && posterData && (
                  <FollowHandler idToFollow={post.posterId} type={"card"} />
                )}
              </div>
              <span>{dateParser(post.createdAt)}</span>
            </div>
            {isUpdated === false && <p>{post.message}</p>}
            {isUpdated && (
              <div className="update-post">
                <textarea
                  value={textUpdate}
                  onChange={(e) => setTextUpdate(e.target.value)}
                />
                <div className="button-container">
                  <button className="btn" onClick={updateItem}>
                    Valider modification
                  </button>
                </div>
              </div>
            )}
            {post.picture && (
              <img src={post.picture} alt="card-pic" className="card-pic" />
            )}
            {post.video && (
              <iframe
                width="500"
                height="300"
                src={post.video}
                style={{ border: "none" }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={post._id}
              ></iframe>
            )}
            {(userData._id === post.posterId || userData.isAdmin) && (
              <div className="button-container">
                <div onClick={() => setIsUpdated(!isUpdated)}>
                  <img src="./img/icons/edit.svg" alt="edit" />
                </div>
                <DeleteCard id={post._id} />
              </div>
            )}
            <div className="card-footer">
              <div className="comment-icon">
                <img
                  onClick={() => setShowComments(!showComments)}
                  src="./img/icons/message1.svg"
                  alt="comment"
                />
                <span>{post.comments.length}</span>
              </div>
              <LikeButton post={post} />
              <img
                src="./img/icons/share.svg"
                alt="share"
                onClick={handleShare}
                style={{ cursor: "pointer" }}
              />
            </div>
            {showComments && <CardComments post={post} />}
          </div>
        </>
      )}
    </li>
  );
};

export default Card;
