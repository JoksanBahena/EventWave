const express = require("express");
const bodyParser = require("body-parser");
const db = require("./src/config/db");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const eventsRoutes = require("./src/routes/eventRoutes");
const usersRoutes = require("./src/routes/userRoutes");
const categoriesRoutes = require("./src/routes/categoryRoutes");
const invitationsRoutes = require("./src/routes/invitationRoutes");
const commentsRoutes = require("./src/routes/commentRoutes");

app.use("/api/events", eventsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/invitations", invitationsRoutes);
app.use("/api/comments", commentsRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Error interno del servidor");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor iniciado en el puerto ${PORT}`);
});
