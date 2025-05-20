import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  applyNodeChanges,
  applyEdgeChanges,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { AnimatePresence } from 'framer-motion';

// Importer le CSS personnalisé
import '../styles/FamilyTree.css';

// Composants
import PersonNode from '../components/FamilyTree/PersonNode';
import NodeContextMenu from '../components/FamilyTree/NodeContextMenu';
import AddPersonModal from '../components/FamilyTree/AddPersonModal';
import EditPersonModal from '../components/FamilyTree/EditPersonModal';
import { useFamilyTreeStore } from '../store/familyTreeStore';
import { useToast } from '../hooks/useToast';
import { v4 as uuidv4 } from 'uuid';

// Types de nœuds personnalisés
const nodeTypes = {
  person: PersonNode,
};

// Options ReactFlow
const proOptions = { hideAttribution: true };

// Styles par défaut pour les arêtes selon le type
const getEdgeStyle = (type) => {
  switch (type) {
    case 'spouse_connection':
      return { stroke: 'hsl(300, 70%, 50%)', strokeWidth: 3 };
    case 'marriage_child_connection':
      return { stroke: 'hsl(220, 70%, 50%)', strokeWidth: 3 };
    case 'parent_child_connection':
    default:
      return { stroke: 'hsl(260, 70%, 60%)', strokeWidth: 3 };
  }
};

/**
 * Page d'arbre généalogique
 * Version améliorée avec fonctionnalités de geneaV2HH
 */
const FamilyTreePage = () => {
  const { id: treeId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  // Référence au conteneur ReactFlow
  const reactFlowWrapper = useRef(null);
  
  // États locaux
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [relationType, setRelationType] = useState(null);
  const [selectedMarriageEdge, setSelectedMarriageEdge] = useState(null);
  
  // Store de l'arbre généalogique
  const {
    currentTree,
    nodes,
    edges,
    isLoading,
    error,
    fetchTreeById,
    resetState,
    updateNodePositions,
    addPerson,
    updatePerson,
    deletePerson,
    addRelationship,
  } = useFamilyTreeStore();

  // Chargement initial de l'arbre
  useEffect(() => {
    if (treeId) {
      fetchTreeById(treeId);
    }
    
    // Nettoyage au démontage
    return () => resetState();
  }, [treeId, fetchTreeById, resetState]);

  // Appliquer les styles aux arêtes
  const styledEdges = edges.map(edge => ({
    ...edge,
    style: getEdgeStyle(edge.data?.type || 'parent_child_connection')
  }));

  // Gestion des modifications de nœuds (positions)
  const onNodesChange = useCallback(
    (changes) => {
      const updatedNodes = applyNodeChanges(changes, nodes);
      
      // Mise à jour des positions si c'est une position qui a changé
      const positionChanges = changes.filter(change => change.type === 'position' && change.position);
      
      if (positionChanges.length > 0) {
        const nodePositions = positionChanges.map(change => ({
          id: change.id,
          position: change.position
        }));
        
        updateNodePositions(nodePositions);
      }
      
      return updatedNodes;
    },
    [nodes, updateNodePositions]
  );

  // Gestion des modifications d'arêtes
  const onEdgesChange = useCallback(
    (changes) => {
      return applyEdgeChanges(changes, styledEdges);
    },
    [styledEdges]
  );

  // Gestion de la connexion entre nœuds
  const onConnect = useCallback(
    (params) => {
      // Détecter le type de relation en fonction des positions
      const sourceNode = nodes.find(n => n.id === params.source);
      const targetNode = nodes.find(n => n.id === params.target);
      
      if (sourceNode && targetNode) {
        // Déterminer le type de relation
        const verticalTolerance = 50;
        const isHorizontalConnection = Math.abs(sourceNode.position.y - targetNode.position.y) < verticalTolerance;
        
        const relationshipType = isHorizontalConnection ? 'spouse' : 'parent';
        const edgeType = isHorizontalConnection ? 'spouse_connection' : 'parent_child_connection';
        
        // Créer un ID unique pour la nouvelle relation
        const newEdgeId = uuidv4();
        
        // Ajouter la relation au store
        addRelationship({
          id: newEdgeId,
          sourceId: params.source,
          targetId: params.target,
          type: relationshipType,
          data: { type: edgeType }
        });
        
        showToast("Un nouveau lien familial a été ajouté", "success");
      }
    },
    [nodes, addRelationship, showToast]
  );

  // Gestion du clic droit sur un nœud
  const onNodeContextMenu = useCallback(
    (event, node) => {
      // Empêcher l'ouverture du menu contextuel du navigateur
      event.preventDefault();
      
      // Rechercher les arêtes de mariage (spouse) liées à ce nœud
      const marriageEdges = edges.filter(
        edge => 
          (edge.source === node.id || edge.target === node.id) && 
          edge.data?.type === 'spouse_connection'
      );
      
      // Positionner le menu contextuel
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        node,
        marriageEdges
      });
    },
    [edges]
  );

  // Fermer le menu contextuel
  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  // Gérer le clic sur le canevas pour fermer le menu contextuel
  const onPaneClick = useCallback(() => {
    closeContextMenu();
  }, [closeContextMenu]);

  // Ouvrir le modal d'ajout de personne
  const openAddModal = useCallback((nodeId, type, marriageEdgeId = null) => {
    setSelectedNode(nodeId);
    setRelationType(type);
    setSelectedMarriageEdge(marriageEdgeId);
    setIsAddModalOpen(true);
    closeContextMenu();
  }, [closeContextMenu]);

  // Ouvrir le modal de modification de personne
  const openEditModal = useCallback((node) => {
    setSelectedNode(node);
    setIsEditModalOpen(true);
    closeContextMenu();
  }, [closeContextMenu]);

  // Fermer tous les modals
  const closeModals = useCallback(() => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedNode(null);
    setRelationType(null);
    setSelectedMarriageEdge(null);
  }, []);

  // Gérer l'ajout d'une nouvelle personne
  const handleAddPerson = useCallback((personData, parentNodeId, relationType, marriageEdgeId) => {
    // Calculer la position du nouveau nœud en fonction du type de relation
    let position = { x: 0, y: 0 };
    
    if (relationType && parentNodeId) {
      const parentNode = nodes.find(node => node.id === parentNodeId);
      
      if (parentNode) {
        switch (relationType) {
          case 'child':
            position = { x: parentNode.position.x, y: parentNode.position.y + 250 };
            break;
          case 'parent':
            position = { x: parentNode.position.x, y: parentNode.position.y - 250 };
            break;
          case 'spouse':
            position = { x: parentNode.position.x + 200, y: parentNode.position.y };
            break;
          case 'sibling':
            position = { x: parentNode.position.x + 200, y: parentNode.position.y };
            break;
          case 'marriage_child':
            // Trouver les époux
            if (marriageEdgeId) {
              const marriageEdge = edges.find(e => e.id === marriageEdgeId);
              if (marriageEdge) {
                const spouse1 = nodes.find(n => n.id === marriageEdge.source);
                const spouse2 = nodes.find(n => n.id === marriageEdge.target);
                if (spouse1 && spouse2) {
                  position = {
                    x: (spouse1.position.x + spouse2.position.x) / 2,
                    y: Math.max(spouse1.position.y, spouse2.position.y) + 250
                  };
                }
              }
            }
            break;
          default:
            break;
        }
      }
    } else if (reactFlowInstance) {
      // Placer au centre du viewport si pas de relation
      const { x, y, zoom } = reactFlowInstance.getViewport();
      position = {
        x: -x / zoom + reactFlowWrapper.current.offsetWidth / 2 / zoom,
        y: -y / zoom + reactFlowWrapper.current.offsetHeight / 2 / zoom
      };
    }
    
    // Ajouter la personne au store
    addPerson(treeId, {
      ...personData,
      position
    }).then(({ success, person, node }) => {
      if (success && person) {
        showToast(`${person.firstName} ${person.lastName} a été ajouté(e) à l'arbre`, 'success');
        
        // Ajouter automatiquement une relation si nécessaire
        if (relationType && parentNodeId) {
          const newEdgeId = uuidv4();
          
          switch (relationType) {
            case 'child':
              // Parent -> Enfant
              addRelationship({
                id: newEdgeId,
                sourceId: parentNodeId,
                targetId: person.id,
                type: 'parent',
                data: { type: 'parent_child_connection' }
              });
              break;
            case 'parent':
              // Enfant -> Parent
              addRelationship({
                id: newEdgeId,
                sourceId: person.id,
                targetId: parentNodeId,
                type: 'parent',
                data: { type: 'parent_child_connection' }
              });
              break;
            case 'spouse':
              // Conjoint -> Conjoint
              addRelationship({
                id: newEdgeId,
                sourceId: parentNodeId,
                targetId: person.id,
                type: 'spouse',
                data: { type: 'spouse_connection' }
              });
              break;
            case 'sibling':
              // Frère/Sœur (relation simplifiée)
              addRelationship({
                id: newEdgeId,
                sourceId: parentNodeId,
                targetId: person.id,
                type: 'sibling',
                data: { type: 'sibling_connection' }
              });
              break;
            case 'marriage_child':
              // Enfant de mariage
              if (marriageEdgeId) {
                const marriageEdge = edges.find(e => e.id === marriageEdgeId);
                if (marriageEdge) {
                  // Créer deux relations parent-enfant
                  addRelationship({
                    id: uuidv4(),
                    sourceId: marriageEdge.source,
                    targetId: person.id,
                    type: 'parent',
                    data: { 
                      type: 'marriage_child_connection',
                      marriageEdgeId: marriageEdgeId
                    }
                  });
                  
                  addRelationship({
                    id: uuidv4(),
                    sourceId: marriageEdge.target,
                    targetId: person.id,
                    type: 'parent',
                    data: { 
                      type: 'marriage_child_connection',
                      marriageEdgeId: marriageEdgeId,
                      isSecondParent: true
                    }
                  });
                }
              }
              break;
            default:
              break;
          }
        }
      } else {
        showToast(person?.message || 'Erreur lors de l\'ajout de la personne', 'error');
      }
    });
    
    closeModals();
  }, [nodes, edges, reactFlowInstance, reactFlowWrapper, addPerson, treeId, showToast, closeModals, addRelationship]);

  // Gérer la mise à jour d'une personne
  const handleEditPerson = useCallback((nodeId, updatedData) => {
    updatePerson(nodeId, updatedData).then(({ success, message }) => {
      if (success) {
        showToast(`Les informations ont été mises à jour`, 'success');
      } else {
        showToast(message || 'Erreur lors de la mise à jour', 'error');
      }
    });
    
    closeModals();
  }, [updatePerson, showToast, closeModals]);

  // Gérer la suppression d'une personne
  const handleDeletePerson = useCallback((nodeId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette personne ? Cette action est irréversible.')) {
      deletePerson(nodeId).then(({ success, message }) => {
        if (success) {
          showToast('La personne a été supprimée de l\'arbre', 'success');
        } else {
          showToast(message || 'Erreur lors de la suppression', 'error');
        }
      });
    }
    
    closeContextMenu();
  }, [deletePerson, showToast, closeContextMenu]);

  // Afficher un message d'erreur si nécessaire
  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="max-w-md text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Erreur</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => fetchTreeById(treeId)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Réessayer
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-secondary text-foreground rounded hover:bg-secondary/90"
            >
              Retour au tableau de bord
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Afficher un indicateur de chargement pendant le chargement
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Chargement de l'arbre généalogique...</p>
      </div>
    );
  }

  return (
    <div 
      className="h-screen w-full bg-background flex flex-col" 
      ref={reactFlowWrapper}
    >
      {currentTree && (
        <div className="py-2 px-4 border-b border-border bg-card">
          <h1 className="text-xl font-semibold text-foreground">{currentTree.name}</h1>
          {currentTree.description && (
            <p className="text-sm text-muted-foreground mt-1">{currentTree.description}</p>
          )}
        </div>
      )}
      
      <div className="flex-grow relative">
        <ReactFlow
          nodes={nodes}
          edges={styledEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onPaneClick={onPaneClick}
          onNodeContextMenu={onNodeContextMenu}
          nodeTypes={nodeTypes}
          fitView
          proOptions={proOptions}
          deleteKeyCode={['Backspace', 'Delete']}
          nodesDraggable={true}
        >
          <Background 
            variant={BackgroundVariant.Dots} 
            gap={24} 
            size={1} 
            color="hsl(var(--foreground) / 0.1)"
          />
          <Controls position="bottom-right" className="react-flow__controls"/>
          <MiniMap position="bottom-left" className="react-flow__minimap"/>
        </ReactFlow>
        
        {/* Menu contextuel */}
        <AnimatePresence>
          {contextMenu && (
            <NodeContextMenu
              x={contextMenu.x}
              y={contextMenu.y}
              node={contextMenu.node}
              onClose={closeContextMenu}
              onAddPerson={openAddModal}
              onEditPerson={openEditModal}
              onDeletePerson={handleDeletePerson}
              marriageEdges={contextMenu.marriageEdges}
            />
          )}
        </AnimatePresence>
      </div>
      
      {/* Modals */}
      <AnimatePresence>
        {isAddModalOpen && (
          <AddPersonModal
            isOpen={isAddModalOpen}
            onClose={closeModals}
            onSubmit={handleAddPerson}
            parentNodeId={typeof selectedNode === 'string' ? selectedNode : selectedNode?.id}
            relationType={relationType}
            marriageEdgeId={selectedMarriageEdge}
          />
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {isEditModalOpen && selectedNode && (
          <EditPersonModal
            isOpen={isEditModalOpen}
            onClose={closeModals}
            onSubmit={handleEditPerson}
            nodeData={selectedNode.data}
            nodeId={selectedNode.id}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default FamilyTreePage;