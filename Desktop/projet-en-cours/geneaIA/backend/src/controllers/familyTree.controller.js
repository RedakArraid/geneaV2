/**
 * Contrôleur pour la gestion des arbres généalogiques
 */

const { validationResult } = require('express-validator');

/**
 * Récupérer tous les arbres généalogiques de l'utilisateur connecté
 */
exports.getAllTrees = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const trees = await prisma.familyTree.findMany({
      where: { ownerId: userId },
      orderBy: { updatedAt: 'desc' }
    });
    
    res.status(200).json({ trees });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupérer un arbre généalogique spécifique avec toutes ses données
 */
exports.getTreeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const tree = await prisma.familyTree.findUnique({
      where: { id },
      include: {
        people: true,
        nodes: true,
        edges: true
      }
    });
    
    if (!tree) {
      return res.status(404).json({ message: 'Arbre généalogique non trouvé' });
    }
    
    res.status(200).json({ tree });
  } catch (error) {
    next(error);
  }
};

/**
 * Créer un nouvel arbre généalogique
 */
exports.createTree = async (req, res, next) => {
  try {
    // Validation des données
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { name, description, isPublic } = req.body;
    const userId = req.user.id;
    
    const newTree = await prisma.familyTree.create({
      data: {
        name,
        description,
        isPublic: isPublic || false,
        owner: { connect: { id: userId } }
      }
    });
    
    res.status(201).json({ 
      message: 'Arbre généalogique créé avec succès',
      tree: newTree 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mettre à jour un arbre généalogique
 */
exports.updateTree = async (req, res, next) => {
  try {
    // Validation des données
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { id } = req.params;
    const { name, description, isPublic } = req.body;
    
    const updatedTree = await prisma.familyTree.update({
      where: { id },
      data: {
        name,
        description,
        isPublic: isPublic !== undefined ? isPublic : undefined
      }
    });
    
    res.status(200).json({ 
      message: 'Arbre généalogique mis à jour avec succès',
      tree: updatedTree 
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Arbre généalogique non trouvé' });
    }
    next(error);
  }
};

/**
 * Supprimer un arbre généalogique
 */
exports.deleteTree = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    await prisma.familyTree.delete({
      where: { id }
    });
    
    res.status(200).json({ 
      message: 'Arbre généalogique supprimé avec succès' 
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Arbre généalogique non trouvé' });
    }
    next(error);
  }
};