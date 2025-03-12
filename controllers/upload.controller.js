const UserModel = require("../models/user.model");
const fs = require("fs").promises;
const { uploadErrors } = require("../utils/errors.utils");

module.exports.uploadProfil = async (req, res) => {
  try {
    // Vérification du type MIME et de la taille du fichier
    console.log(req.file.mimetype); // Vérification du type MIME détecté
    console.log(req.file.size);     // Vérification de la taille du fichier

    if (
      req.file.mimetype !== "image/jpg" &&
      req.file.mimetype !== "image/jpeg" &&
      req.file.mimetype !== "image/png"
    ) {
      throw Error("invalid file");
    }

    if (req.file.size > 500000) throw Error("max size");
  } catch (err) {
    const errors = uploadErrors(err);
    return res.status(400).json({ errors });
  }

  const fileName = req.body.name + ".jpg";
  const filePath = `${__dirname}/../client/public/uploads/profil/${fileName}`;

  // Vérifier que le dossier existe ou le créer
  const dir = `${__dirname}/../client/public/uploads/profil/`;
  try {
    await fs.access(dir);
  } catch (e) {
    await fs.mkdir(dir, { recursive: true });
  }

  // Écriture du fichier sur le disque
  try {
    await fs.writeFile(filePath, req.file.buffer);
    console.log("Fichier enregistré avec succès !");
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: err.message });
  }

  // Mise à jour du modèle utilisateur dans la base de données
  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      req.body.userId,
      { $set: { picture: "./uploads/profil/" + fileName } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    return res.status(200).send(updatedUser);
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: err.message });
  }
};
