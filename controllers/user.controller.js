const UserModel = require("../models/user.model");
const ObjectID = require("mongoose").Types.ObjectId;

module.exports.getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.find().select("-password");
    res.status(200).json(users);
  } catch (err) {
    console.error("Erreur lors de la récupération des utilisateurs :", err);
    res.status(500).json({ message: err });
  }
};

module.exports.userInfo = async (req, res) => {
  if (!ObjectID.isValid(req.params.id)) {
    return res.status(400).send("ID inconnu : " + req.params.id);
  }

  try {
    const user = await UserModel.findById(req.params.id).select("-password");
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).send("Utilisateur non trouvé");
    }
  } catch (err) {
    console.error("Erreur lors de la récupération de l'utilisateur :", err);
    res.status(500).json({ message: err });
  }
};

module.exports.updateUser = async (req, res) => {
  if (!ObjectID.isValid(req.params.id)) {
    return res.status(400).send("ID inconnu : " + req.params.id);
  }

  try {
    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          bio: req.body.bio,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.status(200).json(updatedUser);
  } catch (err) {
    console.error("Erreur lors de la mise à jour de l'utilisateur :", err);
    res.status(500).json({ message: err });
  }
};

module.exports.deleteUser = async (req, res) => {
  if (!ObjectID.isValid(req.params.id)) {
    return res.status(400).send("ID inconnu : " + req.params.id);
  }

  try {
    await UserModel.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: "Utilisateur supprimé avec succès." });
  } catch (err) {
    console.error("Erreur lors de la suppression de l'utilisateur :", err);
    res.status(500).json({ message: err });
  }
};

module.exports.follow = async (req, res) => {
  if (
    !ObjectID.isValid(req.params.id) ||
    !ObjectID.isValid(req.body.idToFollow)
  ) {
    return res.status(400).send("ID inconnu : " + req.params.id);
  }

  try {
    // Ajout à la liste des suivis (following)
    await UserModel.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { following: req.body.idToFollow } },
      { new: true, upsert: true }
    );

    // Ajout à la liste des followers de l'autre utilisateur
    await UserModel.findByIdAndUpdate(
      req.body.idToFollow,
      { $addToSet: { followers: req.params.id } },
      { new: true, upsert: true }
    );

    res.status(201).json({ message: "Suivi effectué avec succès." });
  } catch (err) {
    console.error("Erreur lors du suivi de l'utilisateur :", err);
    res.status(500).json({ message: err });
  }
};

module.exports.unfollow = async (req, res) => {
  if (
    !ObjectID.isValid(req.params.id) ||
    !ObjectID.isValid(req.body.idToUnfollow)
  ) {
    return res.status(400).send("ID inconnu : " + req.params.id);
  }

  try {
    // Retrait de la liste des suivis (following)
    await UserModel.findByIdAndUpdate(
      req.params.id,
      { $pull: { following: req.body.idToUnfollow } },
      { new: true, upsert: true }
    );

    // Retrait de la liste des followers de l'autre utilisateur
    await UserModel.findByIdAndUpdate(
      req.body.idToUnfollow,
      { $pull: { followers: req.params.id } },
      { new: true, upsert: true }
    );

    res.status(200).json({ message: "Désabonnement effectué avec succès." });
  } catch (err) {
    console.error("Erreur lors du désabonnement de l'utilisateur :", err);
    res.status(500).json({ message: err });
  }
};
