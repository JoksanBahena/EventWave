const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const routes = require('./src/routes/indexRoutes')

const app = express();

app.use(bodyParser.json());
app.use(cors());

mongoose.connect('mongodb+srv://admin:7XSBkWLZufxXSkAL@eventwave.eytysvz.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true })
  .then(() => console.log('Conexión con MongoDB exitosa'))
  .catch(err => console.log(err));

app.use(routes);

const port = 3000;
app.listen(port, () => console.log(`Servidor corriendo en el puerto ${port}`));
