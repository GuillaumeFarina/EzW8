const PostModel = require("../models/post.model");
const UserModel = require("../models/user.model");
const { uploadErrors } = require("../utils/errors.utils");
const ObjectID = require("mongoose").Types.ObjectId;
const fs = require("fs").promises;

module.exports.readPost = async (req, res) => {
  try {
    const posts = await PostModel.find().sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    console.error("Erreur lors de la récupération des posts : ", err);
    res.status(500).json({ message: err.message });
  }
};

module.exports.createPost = async (req, res) => {
  let fileName;

  if (req.file != null) {
    try {
      console.log(req.file.mimetype); // Vérification du type MIME détecté
      console.log(req.file.size);     // Vérification de la taille du fichier

      // Vérification du format du fichier
      if (
        req.file.mimetype !== "image/jpg" &&
        req.file.mimetype !== "image/jpeg" &&
        req.file.mimetype !== "image/png"
      ) {
        throw Error("invalid file");
      }

      // Vérification de la taille du fichier
      if (req.file.size > 500000) throw Error("max size");

      // Création du nom de fichier
      fileName = req.body.posterId + Date.now() + ".jpg";
      const filePath = `${__dirname}/../client/public/uploads/posts/${fileName}`;

      // Vérification que le dossier existe ou création
      const dir = `${__dirname}/../client/public/uploads/posts/`;
      try {
        await fs.access(dir);
      } catch (e) {
        await fs.mkdir(dir, { recursive: true });
      }

      // Écriture du fichier sur le disque
      await fs.writeFile(filePath, req.file.buffer);
      console.log("Fichier enregistré avec succès !");
    } catch (err) {
      const errors = uploadErrors(err);
      return res.status(400).json({ errors });
    }
  }

  const newPost = new PostModel({
    posterId: req.body.posterId,
    message: req.body.message,
    title: req.body.title,
    location: req.body.location,
    date: req.body.date,
    picture: req.file != null ? "./uploads/posts/" + fileName : "",
    video: req.body.video,
    likers: [],
    comments: [],
  });

  try {
    const post = await newPost.save();
    return res.status(201).json(post);
  } catch (err) {
    console.error("Erreur lors de la création du post : ", err);
    return res.status(400).json({ message: err.message });
  }
};

module.exports.updatePost = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID inconnu : " + req.params.id);

  try {
    const updatedPost = await PostModel.findByIdAndUpdate(
      req.params.id,
      { $set: { message: req.body.message } },
      { new: true }
    );
    res.status(200).json(updatedPost);
  } catch (err) {
    console.error("Erreur lors de la mise à jour : ", err);
    res.status(500).json({ message: err.message });
  }
};

module.exports.deletePost = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID inconnu : " + req.params.id);

  try {
    await PostModel.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Post supprimé avec succès." });
  } catch (err) {
    console.error("Erreur lors de la suppression : ", err);
    res.status(500).json({ message: err.message });
  }
};

module.exports.likePost = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID inconnu : " + req.params.id);

  try {
    await PostModel.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { likers: req.body.id } },
      { new: true }
    );

    const user = await UserModel.findByIdAndUpdate(
      req.body.id,
      { $addToSet: { likes: req.params.id } },
      { new: true }
    );
    res.status(200).json(user);
  } catch (err) {
    console.error("Erreur lors du like : ", err);
    res.status(500).json({ message: err.message });
  }
};

module.exports.unlikePost = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID inconnu : " + req.params.id);

  try {
    await PostModel.findByIdAndUpdate(
      req.params.id,
      { $pull: { likers: req.body.id } },
      { new: true }
    );

    const user = await UserModel.findByIdAndUpdate(
      req.body.id,
      { $pull: { likes: req.params.id } },
      { new: true }
    );
    res.status(200).json(user);
  } catch (err) {
    console.error("Erreur lors du unlike : ", err);
    res.status(500).json({ message: err.message });
  }
};

module.exports.commentPost = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID inconnu : " + req.params.id);

  try {
    const post = await PostModel.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          comments: {
            commenterId: req.body.commenterId,
            commenterPseudo: req.body.commenterPseudo,
            text: req.body.text,
            title: req.body.title,
            location: req.body.location,
            date: req.body.date,
            timestamp: new Date().getTime(),
          },
        },
      },
      { new: true }
    );
    res.status(200).json(post);
  } catch (err) {
    console.error("Erreur lors de l'ajout du commentaire : ", err);
    res.status(500).json({ message: err.message });
  }
};

module.exports.editCommentPost = async (req, res) => {
  if (
    !ObjectID.isValid(req.params.id) ||
    !ObjectID.isValid(req.body.commentId)
  )
    return res.status(400).send("ID inconnu : " + req.params.id);

  try {
    const post = await PostModel.findById(req.params.id);
    if (!post) return res.status(404).send("Post non trouvé");

    const comment = post.comments.id(req.body.commentId);
    if (!comment) return res.status(404).send("Commentaire non trouvé");

    comment.text = req.body.text;

    await post.save();
    res.status(200).json(post);
  } catch (err) {
    console.error("Erreur lors de la modification du commentaire : ", err);
    res.status(500).json({ message: err.message });
  }
};

module.exports.deleteCommentPost = async (req, res) => {
  if (
    !ObjectID.isValid(req.params.id) ||
    !ObjectID.isValid(req.body.commentId)
  )
    return res.status(400).send("ID inconnu : " + req.params.id);

  try {
    const post = await PostModel.findByIdAndUpdate(
      req.params.id,
      {
        $pull: { comments: { _id: req.body.commentId } },
      },
      { new: true }
    );
    res.status(200).json(post);
  } catch (err) {
    console.error("Erreur lors de la suppression du commentaire : ", err);
    res.status(500).json({ message: err.message });
  }
};
