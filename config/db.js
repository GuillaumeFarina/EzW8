const mongoose = require("mongoose");

mongoose
  .connect(
    "mongodb+srv://" + process.env.DB_USER_PASS + "@cluster0.7jlrp.mongodb.net/EZW8",
  )
  .then(() => console.log("Connected to MongoDB"))
