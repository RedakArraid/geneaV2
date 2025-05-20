/**
 * Contrôleur pour la gestion des arêtes dans l'arbre généalogique (ReactFlow)
 */

const { validationResult } = require('express-validator');

/**
 * Récupérer toutes les arêtes d'un arbre généalogique
 */
exports.getAllEdges = async (req, res, next) => {
  try {
    const { treeId } = req.params;
    
    const edges = await prisma.edge.findMany({
      where: { treeId }
    });
    
    res.status(200).json({ edges });
  } catch (error) {
    next(error);
  }
};

/**
 * Créer une nouvelle arête
 */
exports.createEdge = async (req, res, next) => {
  try {
    // Validation des données
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { source, target, type, data, treeId } = req.body;
    
    // Vérifier que l'arbre existe
    const tree = await prisma.familyTree.findUnique({
      where: { id: treeId }
    });
    
    if (!tree) {
      return res.status(404).json({ message: 'Arbre généalogique non trouvé' });
    }
    
    // Créer l'arête
    const edge = await prisma.edge.create({
      data: {
        source,
        target,
        type,
        data: typeof data === 'object' ? JSON.stringify(data) : data,
        treeId
      }
    });
    
    res.status(201).json({
      message: 'Arête créée avec succès',
      edge
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mettre à jour une arête
 */
exports.updateEdge = async (req, res, next) => {
  try {
    // Validation des données
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { id } = req.params;
    const { source, target, type, data } = req.body;
    
    const edge = await prisma.edge.update({
      where: { id },
      data: {
        source,
        target,
        type,
        data: typeof data === 'object' ? JSON.stringify(data) : data
      }
    });
    
    res.status(200).json({
      message: 'Arête mise à jour avec succès',
      edge
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Arête non trouvée' });
    }
    next(error);
  }
};

/**
 * Supprimer une arête
 */
exports.deleteEdge = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    await prisma.edge.delete({
      where: { id }
    });
    
    res.status(200).json({
      message: 'Arête supprimée avec succès'
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Arête non trouvée' });
    }
    next(error);
  }
};