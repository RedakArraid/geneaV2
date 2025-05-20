/**
 * Routes pour la gestion des personnes
 */

const express = require('express');
const { body } = require('express-validator');
const personController = require('../controllers/person.controller');
const { isAuth, isOwner } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * @route GET /api/persons/tree/:treeId
 * @desc Récupérer toutes les personnes d'un arbre généalogique
 * @access Private
 */
router.get('/tree/:treeId', isAuth, isOwner('FamilyTree'), personController.getAllPersons);

/**
 * @route GET /api/persons/:id
 * @desc Récupérer une personne par son ID
 * @access Private
 */
router.get('/:id', isAuth, personController.getPersonById);

/**
 * @route POST /api/persons/tree/:treeId
 * @desc Créer une nouvelle personne dans un arbre généalogique
 * @access Private
 */
router.post(
  '/tree/:treeId',
  isAuth,
  isOwner('FamilyTree'),
  [
    body('firstName').trim().notEmpty().withMessage('Le prénom est requis'),
    body('lastName').trim().notEmpty().withMessage('Le nom de famille est requis'),
    body('birthDate').optional().isISO8601().toDate().withMessage('Format de date de naissance invalide'),
    body('birthPlace').optional(),
    body('deathDate').optional().isISO8601().toDate().withMessage('Format de date de décès invalide'),
    body('occupation').optional(),
    body('biography').optional(),
    body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Genre invalide'),
    body('photoUrl').optional()
  ],
  personController.createPerson
);

/**
 * @route PUT /api/persons/:id
 * @desc Mettre à jour une personne
 * @access Private
 */
router.put(
  '/:id',
  isAuth,
  [
    body('firstName').optional().trim().notEmpty().withMessage('Le prénom ne peut pas être vide'),
    body('lastName').optional().trim().notEmpty().withMessage('Le nom de famille ne peut pas être vide'),
    body('birthDate').optional().isISO8601().toDate().withMessage('Format de date de naissance invalide'),
    body('birthPlace').optional(),
    body('deathDate').optional().isISO8601().toDate().withMessage('Format de date de décès invalide'),
    body('occupation').optional(),
    body('biography').optional(),
    body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Genre invalide'),
    body('photoUrl').optional()
  ],
  personController.updatePerson
);

/**
 * @route DELETE /api/persons/:id
 * @desc Supprimer une personne
 * @access Private
 */
router.delete('/:id', isAuth, personController.deletePerson);

module.exports = router;