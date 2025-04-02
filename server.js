require('dotenv').config();
const express = require('express');
const cors = require('cors')
const mongoose = require('mongoose');
const router = require('./router');
const cookieParser = require('cookie-parser');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
app.use(express.json());
app.use(cors());

// Définition des options Swagger
const swaggerOptions = {
	definition: {
	  openapi: '3.0.0',
	  info: {
		title: 'API Potions',
		version: '1.0.0',
		description: 'Documentation de l\'API des potions avec Swagger',
	  },
	  servers: [
		{
		  url: 'http://localhost:3000',
		  description: 'Serveur local',
		},
	  ],
	},
	apis: ['./auth.routes.js', './router.js'], // Chemin vers ton fichier de routes
};

// Générer la documentation Swagger
const swaggerDocs = swaggerJsdoc(swaggerOptions);

app.use(cookieParser());
app.use(require('sanitize').middleware);
app.use('/auth', require('./auth.routes'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connecté à MongoDB'))
    .catch(err => console.error('Erreur MongoDB :', err));

app.use('/potions', router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});

