const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('./user.model');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const COOKIE_NAME = process.env.COOKIE_NAME || 'demo_node+mongo_token';
const { body, validationResult } = require('express-validator');
/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           description: Nom d'utilisateur
 *           minLength: 3
 *           maxLength: 30
 *         password:
 *           type: string
 *           description: Mot de passe de l'utilisateur
 *           minLength: 6
 *           format: password
 */
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Crée un nouvel utilisateur
 *     description: Crée un nouvel utilisateur en base de données.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *            $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *       400:
 *        description: Erreur de validation
 *       500:
 *        description: Erreur système
 */
// POST /auth/register  toujours passer les inputs user au sanitize()
router.post('/register', [
    body('username').trim().escape()
      .notEmpty().withMessage('Le nom d’utilisateur est requis.')
      .isLength({ min: 3, max: 30 }).withMessage('Doit faire entre 3 et 30 caractères.'),
    body('password').trim().escape()
      .notEmpty().withMessage('Le mot de passe est requis.')
      .isLength({ min: 6 }).withMessage('Minimum 6 caractères.')
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { username, password } = req.body;
  
    try {
      const user = new User({ username, password });
      await user.save();
      res.status(201).json({ message: 'Utilisateur créé' });
    } catch (err) {
      if (err.code === 11000) return res.status(500).json(err.message);
      res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Connecter un utilisateur
 *     description: Connexion de l'utilisateur.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *            $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Utilisateur connecté avec succès
 *       401:
 *        description: Identifiants invalides
 */
// POST /auth/login
router.post('/login', async (req, res) => {
  // toujours passer les inputs user au sanitize()
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ error: 'Identifiants invalides' });
  }

  const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '1d' });

  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: false,
    maxAge: 24 * 60 * 60 * 1000
  });

  res.json({ message: 'Connecté avec succès' });
});
  
/**
 * @swagger
 * /auth/logout:
 *   get:
 *     summary: Déonnecter un utilisateur
 *     description: Déconnecte un utilisateur, supprime le cookie.
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Utilisateur déconnecté avec succès
 *       500:
 *        description: Erreur serveur
 */
// GET /auth/logout
router.get('/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME);
  res.json({ message: 'Déconnecté' });
});
  
module.exports = router;