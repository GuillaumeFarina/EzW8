import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { isEmpty } from "../Utils";
import { NavLink } from "react-router-dom";
import { addPost, getPosts } from "../../actions/post.actions";

const NewPostForm = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [postPicture, setPostPicture] = useState(null);
  const [video, setVideo] = useState("");
  const [file, setFile] = useState(null);

  const userData = useSelector((state) => state.userReducer);
  const error = useSelector((state) => state.errorReducer.postError);
  const dispatch = useDispatch();

  const handlePost = async () => {
    if (message || postPicture || video) {
      const data = new FormData();
      data.append("posterId", userData._id);
      data.append("message", message);
      data.append("title", title);
      data.append("location", location);
      data.append("date", date);
      if (file) data.append("file", file);
      data.append("video", video);

      await dispatch(addPost(data));
      dispatch(getPosts());
      cancelPost();
    } else {
      alert("Veuillez entrer un message");
    }
  };

  const handlePicture = (e) => {
    setPostPicture(URL.createObjectURL(e.target.files[0]));
    setFile(e.target.files[0]);
    setVideo("");
  };

  const cancelPost = () => {
    setMessage("");
    setTitle("");
    setLocation("");
    setDate("");
    setPostPicture(null);
    setVideo("");
    setFile(null);
  };

  useEffect(() => {
    if (!isEmpty(userData)) setIsLoading(false);

    const handleVideo = () => {
      let findLink = message.split(" ");
      for (let i = 0; i < findLink.length; i++) {
        if (
          findLink[i].includes("https://www.yout") ||
          findLink[i].includes("https://yout")
        ) {
          let embed = findLink[i].replace("watch?v=", "embed/");
          setVideo(embed.split("&")[0]);
          findLink.splice(i, 1);
          setMessage(findLink.join(" "));
          setPostPicture("");
        }
      }
    };
    handleVideo();
  }, [userData, message, video]);

  return (
    <div className="post-container">
      {isLoading ? (
        <i className="fas fa-spinner fa-pulse"></i>
      ) : (
        <>
          <div className="data">
            <p>
              <span>{userData.following ? userData.following.length : 0}</span>{" "}
              Abonnement
              {userData.following && userData.following.length > 1 ? "s" : null}
            </p>
            <p>
              <span>{userData.followers ? userData.followers.length : 0}</span>{" "}
              Abonné
              {userData.followers && userData.followers.length > 1 ? "s" : null}
            </p>
          </div>
          <NavLink to="/profil">
            <div className="user-info">
              <img src={userData.picture} alt="user-img" />
            </div>
          </NavLink>
          <div className="post-form">
            <h2>Créer une demande</h2>
            <input
              type="text"
              placeholder="Titre"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <textarea
              name="message"
              id="message"
              placeholder="Description"
              onChange={(e) => setMessage(e.target.value)}
              value={message}
              required
            />
            <input
              type="text"
              placeholder="Lieu"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
            <div className="icon">
              {!video && (
                <>
                  <img src="./img/icons/picture.svg" alt="img" />
                  <input
                    type="file"
                    id="file-upload"
                    name="file"
                    accept=".jpg, .jpeg, .png"
                    onChange={handlePicture}
                  />
                </>
              )}
              {video && (
                <button onClick={() => setVideo("")}>Supprimer vidéo</button>
              )}
            </div>
            {postPicture && (
              <div className="preview">
                <img src={postPicture} alt="aperçu" />
              </div>
            )}
            {video && (
              <iframe
                src={video}
                style={{ border: "none" }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={video}
              ></iframe>
            )}
            {!isEmpty(error.format) && <p>{error.format}</p>}
            {!isEmpty(error.maxSize) && <p>{error.maxSize}</p>}
            <div className="btn-send">
              {(message || postPicture || video.length > 20) && (
                <button className="cancel" onClick={cancelPost}>
                  Annuler message
                </button>
              )}
              <button className="send" onClick={handlePost}>
                Publier
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NewPostForm;
