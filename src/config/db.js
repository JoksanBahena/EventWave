const mongoose = require("mongoose");

const url =
  "mongodb+srv://admin:7XSBkWLZufxXSkAL@eventwave.eytysvz.mongodb.net/?retryWrites=true&w=majority";

mongoose
  .connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Conexión con MongoDB establecida exitosamente"))
  .catch((err) => console.log("Error de conexión con MongoDB:", err));
