/**
 * Contrôleur pour la gestion des personnes dans l'arbre généalogique
 */

const { validationResult } = require('express-validator');

/**
 * Récupérer toutes les personnes d'un arbre généalogique
 */
exports.getAllPersons = async (req, res, next) => {
  try {
    const { treeId } = req.params;
    
    const persons = await prisma.person.findMany({
      where: { treeId },
      orderBy: { lastName: 'asc' }
    });
    
    res.status(200).json({ persons });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupérer une personne spécifique
 */
exports.getPersonById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const person = await prisma.person.findUnique({
      where: { id },
      include: {
        sourceRelations: {
          include: { target: true }
        },
        targetRelations: {
          include: { source: true }
        }
      }
    });
    
    if (!person) {
      return res.status(404).json({ message: 'Personne non trouvée' });
    }
    
    res.status(200).json({ person });
  } catch (error) {
    next(error);
  }
};

/**
 * Créer une nouvelle personne
 */
exports.createPerson = async (req, res, next) => {
  try {
    // Validation des données
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { treeId } = req.params;
    const {
      firstName,
      lastName,
      birthDate,
      birthPlace,
      deathDate,
      occupation,
      biography,
      gender,
      photoUrl
    } = req.body;
    
    // Vérification que l'arbre existe
    const tree = await prisma.familyTree.findUnique({
      where: { id: treeId }
    });
    
    if (!tree) {
      return res.status(404).json({ message: 'Arbre généalogique non trouvé' });
    }
    
    // Création de la personne
    const newPerson = await prisma.person.create({
      data: {
        firstName,
        lastName,
        birthDate: birthDate ? new Date(birthDate) : null,
        birthPlace,
        deathDate: deathDate ? new Date(deathDate) : null,
        occupation,
        biography,
        gender,
        photoUrl,
        tree: { connect: { id: treeId } }
      }
    });
    
    res.status(201).json({
      message: 'Personne créée avec succès',
      person: newPerson
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mettre à jour une personne
 */
exports.updatePerson = async (req, res, next) => {
  try {
    console.log('Requête de mise à jour reçue pour la personne ID:', req.params.id);
    console.log('Contenu de req.body:', {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      // Ne pas logger toute la photoUrl pour des raisons de performances, juste sa taille
      photoUrlSize: req.body.photoUrl ? req.body.photoUrl.length : 0,
      photoUrlStart: req.body.photoUrl ? req.body.photoUrl.substring(0, 30) + '...' : null
    });
    
    // Validation des données
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Erreurs de validation:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { id } = req.params;
    const {
      firstName,
      lastName,
      birthDate,
      birthPlace,
      deathDate,
      occupation,
      biography,
      gender,
      photoUrl
    } = req.body;
    
    // Créer un objet de données à mettre à jour avec uniquement les champs fournis
    const updateData = {};
    
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (birthDate !== undefined) updateData.birthDate = birthDate ? new Date(birthDate) : null;
    if (birthPlace !== undefined) updateData.birthPlace = birthPlace;
    if (deathDate !== undefined) updateData.deathDate = deathDate ? new Date(deathDate) : null;
    if (occupation !== undefined) updateData.occupation = occupation;
    if (biography !== undefined) updateData.biography = biography;
    if (gender !== undefined) updateData.gender = gender;
    if (photoUrl !== undefined) {
      console.log('Photo URL fournie, longueur:', photoUrl.length);
      updateData.photoUrl = photoUrl;
    }
    
    try {
      const updatedPerson = await prisma.person.update({
        where: { id },
        data: updateData
      });
      
      console.log('Personne mise à jour avec succès, ID:', updatedPerson.id);
      res.status(200).json({
        message: 'Personne mise à jour avec succès',
        person: updatedPerson
      });
    } catch (dbError) {
      console.error('Erreur Prisma lors de la mise à jour:', dbError);
      if (dbError.code === 'P2025') {
        return res.status(404).json({ message: 'Personne non trouvée' });
      }
      throw dbError; // Remonter l'erreur pour le catch global
    }
  } catch (error) {
    console.error('Erreur générale updatePerson:', error);
    next(error);
  }
};

/**
 * Supprimer une personne
 */
exports.deletePerson = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    await prisma.person.delete({
      where: { id }
    });
    
    res.status(200).json({
      message: 'Personne supprimée avec succès'
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Personne non trouvée' });
    }
    next(error);
  }
};