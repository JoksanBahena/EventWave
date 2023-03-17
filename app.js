const express = require("express");
const bodyParser = require("body-parser");
const db = require("./src/config/db");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const eventsRoutes = require("./src/routes/eventRoutes");
const usersRoutes = require('./src/routes/userRoutes');
// const invitationsRoutes = require('./routes/invitationsRoutes');
// const commentsRoutes = require('./routes/commentsRoutes');
// const categoriesRoutes = require('./routes/categoriesRoutes');
app.use("/api/events", eventsRoutes);
app.use('/api/users', usersRoutes);
// app.use('/api/invitations', invitationsRoutes);
// app.use('/api/comments', commentsRoutes);
// app.use('/api/categories', categoriesRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Error interno del servidor");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor iniciado en el puerto ${PORT}`);
});
