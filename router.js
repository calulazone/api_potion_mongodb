const express = require('express');
const router = express.Router();
const Potion = require('./potion.model');
const authMiddleware = require('./auth.middleware');
router.use(authMiddleware);

// routes de notre api potions

/**
 * @swagger
 * components:
 *   schemas:
 *     Potion:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Nom de la potion
 *         price:
 *           type: number
 *           description: Prix de la potion
 *         score:
 *           type: number
 *           description: Score de la potion
 *         count:
 *           type: number
 *           description: Nombre de potions disponibles      
 *         ingredients:
 *           type: array
 *           items:
 *             type: string
 *           description: Liste des ingrédients de la potion
 *         ratings:
 *           type: object
 *           properties:
 *             strength:
 *               type: number
 *               description: Force de la potion
 *             flavor:
 *               type: number
 *               description: Parfum de la potion
 *         categories:
 *           type: array
 *           items:
 *             type: string
 *           description: Liste des catégories de la potion
 */

/**
 * @swagger
 * /potions/all:
 *   get:
 *     summary: Récupérer toutes les potions
 *     tags: [Potions CRUD]
 *     description: Retourne la liste complète des potions disponibles.
 *     responses:
 *       200:
 *         description: Liste des potions récupérée avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Potion'
 *       500:
 *         description: Erreur serveur.
 */

// GET /potions : lire toutes les potions
router.get('/all', async (req, res) => {
    try {
      const potions = await Potion.find();
      res.json(potions);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /potions/names:
 *   get:
 *     summary: Récupérer uniquement les noms de toutes les potions
 *     tags: [Potions]
 *     description: Retourne un tableau contenant uniquement les noms des potions disponibles.
 *     responses:
 *       200:
 *         description: Liste des noms des potions récupérée avec succès.
 *       500:
 *         description: Erreur serveur.
 */

// GET /names : récupérer uniquement les noms de toutes les potions
router.get('/names', async (req, res) => {
  try {
      const names = await Potion.find({}, 'name'); // On ne sélectionne que le champ 'name'
      res.json(names.map(p => p.name)); // renvoyer juste un tableau de strings
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /potions/vendor/{vendor_id}:
 *   get:
 *     summary: Récupérer toutes les potions d’un vendeur
 *     tags: [Potions]
 *     description: Retourne toutes les potions associées à un vendeur spécifique.
 *     parameters:
 *       - in: path
 *         name: vendor_id
 *         required: true
 *         description: ID unique du vendeur
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des potions du vendeur récupérée avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Potion'
 *       500:
 *         description: Erreur serveur.
 */

//GET /potions/vendor/:vendor_id : toutes les potions d’un vendeur
router.get('/vendor/:vendor_id', async (req, res) => {
  try {
      const potions = await Potion.find({vendor_id : req.params['vendor_id']});
      res.json(potions);
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});

//GET /potions/price-range?min=X&max=Y : potions entre min et max
/**
 * @swagger
 * /potions/price-range:
 *   get:
 *     summary: Récupérer les potions dans une plage de prix
 *     tags: [Potions]
 *     description: Retourne les potions dont le prix est compris entre une valeur minimale et maximale.
 *     parameters:
 *       - in: query
 *         name: min
 *         required: true
 *         description: Prix minimum
 *         schema:
 *           type: number
 *       - in: query
 *         name: max
 *         required: true
 *         description: Prix maximum
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Liste des potions récupérée avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Potion'
 *       400:
 *         description: Requête invalide.
 *       500:
 *         description: Erreur serveur.
 */
router.get('/price-range', async (req, res) => {
  try {
    const min = Number(req.query.min);
    const max = Number(req.query.max);
    const potions = await Potion.find({ price: { $gt: min, $lt: max } });
    res.json(potions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /analytics/distinct-categories aggregat du nombre total de catégories différentes
/**
 * @swagger
 * /potions/analytics/distinct-categories:
 *   get:
 *     summary: Récupérer le nombre total de catégories distinctes
 *     tags: [Analytics]
 *     description: Retourne le nombre total de catégories distinctes parmi toutes les potions.
 *     responses:
 *       200:
 *         description: Nombre total de catégories distinctes récupéré avec succès.
 *       500:
 *         description: Erreur serveur.
 */
router.get('/analytics/distinct-categories', async (req, res) => {
  try {
      const potions = await Potion.aggregate([
          { $unwind: "$categories" },
          { $group: { _id: "$categories" } },
          { $count: "nombreCategories" }
        ]);
      res.json(potions);
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});

// GET /analytics/average-score-by-vendor aggregat du score moyen des vendeurs
/**
 * @swagger
 * /potions/analytics/average-score-by-vendor:
 *   get:
 *     summary: Récupérer le score moyen par vendeur
 *     tags: [Analytics]
 *     description: Retourne le score moyen des potions pour chaque vendeur.
 *     responses:
 *       200:
 *         description: Score moyen par vendeur récupéré avec succès.
 *       500:
 *         description: Erreur serveur.
 */
router.get('/analytics/average-score-by-vendor', async (req, res) => {
  try {
      const potions = await Potion.aggregate([
          { $group: { _id: "$vendor_id", averageScore: { $avg: "$score" } } }
      ]);
      res.json(potions);
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});

// GET /analytics/average-score-by-category aggregat du score moyen des categories
/**
 * @swagger
 * /potions/analytics/average-score-by-category:
 *   get:
 *     summary: Récupérer le score moyen par catégorie
 *     tags: [Analytics]
 *     description: Retourne le score moyen des potions pour chaque catégorie.
 *     responses:
 *       200:
 *         description: Score moyen par catégorie récupéré avec succès.
 *       500:
 *         description: Erreur serveur.
 */
router.get('/analytics/average-score-by-category', async (req, res) => {
  try {
      const potions = await Potion.aggregate([
          { $unwind: "$categories" },
          { $group: { _id: "$categories", averageScore: { $avg: "$score" } } }
      ]);
      res.json(potions);
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});

// GET /analytics/strength-flavor-ratio ratio entre force et parfum des potions
/**
 * @swagger
 * /potions/analytics/strength-flavor-ratio:
 *   get:
 *     summary: Récupérer le ratio entre la force et le parfum des potions
 *     tags: [Analytics]
 *     description: Retourne le ratio entre la force et le parfum pour chaque potion.
 *     responses:
 *       200:
 *         description: Ratios récupérés avec succès.
 *       500:
 *         description: Erreur serveur.
 */
router.get('/analytics/strength-flavor-ratio', async (req, res) => {
  try {
      const potions = await Potion.aggregate([
          { $project: { ratio: { $divide: ["$ratings.strength", "$ratings.flavor"] } } }
      ]);
      res.json(potions);
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});

// GET /analytics/search fonction de recherche avec 3 paramètres :
/**
 * @swagger
 * /potions/analytics/search:
 *   get:
 *     summary: Recherer des potions avec plusieurs paramètres
 *     tags: [Analytics]
 *     description: Effectue des analyses statistiques sur les potions selon un groupement, une métrique et un champ.
 *     parameters:
 *       - in: query
 *         name: group
 *         required: true
 *         description: Critère de groupement
 *         schema:
 *           type: string
 *           enum: [vendor_id, categories]
 *       - in: query
 *         name: metric
 *         required: true
 *         description: Type de métrique à appliquer
 *         schema:
 *           type: string
 *           enum: [avg, sum, count]
 *       - in: query
 *         name: champ
 *         description: Champ sur lequel appliquer la métriques
 *         schema:
 *           type: string
 *           enum: [score, price, ratings, parfums, ""]
 *     responses:
 *       200:
 *         description: Résultat de la recherche.
 *       400:
 *         description: Paramètres invalides.
 *       500:
 *         description: Erreur serveur.
 */
router.get('/analytics/search', async (req, res) => {
  try {
    let { group, metric, champ } = req.query;

    // Vérification des paramètres
    const validGroups = ['vendor_id', 'categories'];
    const validMetrics = ['avg', 'sum', 'count'];
    const validChamps = ['score', 'price', 'ratings'];

    if (!validGroups.includes(group) || !validMetrics.includes(metric)) {
      return res.status(400).json({ error: 'Paramètres invalides' });
    }

    let aggregation = [];

    // Si on groupe par categories, il faut utiliser $unwind
    if (group === 'categories') {
      aggregation.push({ $unwind: `$${group}` });
    }

    if (metric === 'count') {
      aggregation.push({
        $group: {
          _id: `$${group}`,
          count: { $sum: 1 }
        }
      });
    } else if (metric === 'sum') {
      aggregation.push({
        $group: {
          _id: `$${group}`,
          total: { $sum: `$${champ}` }
        }
      });
    } else if (metric === 'avg') {
      aggregation.push({
        $group: {
          _id: `$${group}`,
          average: { $avg: `$${champ}` }
        }
      });
    }

    const result = await Potion.aggregate(aggregation);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /potions/{id}:
 *   get:
 *     summary: Récupérer une seule potion par son ID
 *     tags: [Potions CRUD]
 *     description: Retourne l'objet Potion correspondant.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID unique de la potion
 *     responses:
 *       200:
 *         description: Potion récupérée avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Potion'
 *       500:
 *         description: Erreur serveur.
 */
// GET /potions/detail/:id : lire une potion par ID
router.get('/:id', async (req, res) => {
  try {
    const potions = await Potion.findById(req.params.id);
    res.json(potions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /potions:
 *   post:
 *     summary: Créer une nouvelle potion
 *     tags: [Potions CRUD]
 *     description: Ajoute une nouvelle potion à la base de données.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Potion'
 *     responses:
 *       201:
 *         description: Potion créée avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Potion'
 *       400:
 *         description: Requête invalide.
 *       500:
 *         description: Erreur serveur.
 */

// POST /potions : créer une nouvelle potion
router.post('/', authMiddleware, async (req, res) => {
  try {
    const newpotion = new Potion(req.body);
    const potions = await newpotion.save();
    res.status(201).json(potions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /potions/{id}:
 *   put:
 *     summary: Mettre à jour une potion
 *     tags: [Potions CRUD]
 *     description: Met à jour les informations d'une potion.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID unique de la potion à mettre à jour
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Potion'
 *     responses:
 *       200:
 *         description: Potion mise à jour avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Potion'
 *       400:
 *         description: Requête invalide.
 *       500:
 *         description: Erreur serveur.
 */

// PUT /potions/:id : mettre à jour une potion
router.put('/:id', async (req, res) => {
  try {
    const potions = await Potion.updateOne({ _id: req.params.id }, req.body);
    res.json(potions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /potions/{id}:
 *   delete:
 *     summary: Supprimer une potion
 *     tags: [Potions CRUD]
 *     description: Supprime une potion de la base de données par son ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID unique de la potion à supprimer
 *     responses:
 *       200:
 *         description: Potion supprimée avec succès.
 *       500:
 *         description: Erreur serveur.
 */

// DELETE /potions/:id : supprimer une potion
router.delete('/:id', async (req, res) => {
  try {
    const potions = await Potion.deleteOne({ _id: req.params.id });
    res.json(potions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
 
module.exports = router;