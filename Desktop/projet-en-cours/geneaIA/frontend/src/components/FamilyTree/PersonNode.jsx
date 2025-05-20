import React, { useState, useCallback, memo } from 'react';
import { Handle, Position } from 'reactflow';
import { User, Edit3, PlusCircle, Trash2, Users, UserPlus, Link as LinkIcon, Calendar, MapPin, Baby } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFamilyTreeStore } from '../../store/familyTreeStore';
import { compressImage, ensureBase64Size } from '../../utils/imageCompression';

/**
 * Composant PersonNode - Représente une personne dans l'arbre généalogique
 * Version améliorée avec compression d'image optimisée
 */
const PersonNode = ({ data, isConnectable, selected, id }) => {
  const { updatePerson, nodes, edges } = useFamilyTreeStore();
  const [showActions, setShowActions] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Gérer les erreurs de chargement d'image
  const handleImageError = (e) => {
    e.target.style.display = 'none'; 
    const placeholder = e.target.nextElementSibling;
    if (placeholder) placeholder.style.display = 'flex';
  };

  // Gérer l'upload d'image avec optimisation
  const handleImageUpload = useCallback(async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      setIsUploading(true);
      console.log('Début du processus d\'upload, taille du fichier:', Math.round(file.size / 1024), 'KB, type:', file.type);
      
      // Première compression avec qualité faible
      const compressedImage = await compressImage(file, 200, 200, 0.3); // Réduit à 200x200 et qualité 30%
      console.log('Image compressée, taille estimée:', Math.round((compressedImage.length * 0.75) / 1024), 'KB');
      
      // Compression encore plus forte si nécessaire
      const optimizedImage = await ensureBase64Size(compressedImage, 500000); // Limite à 500KB
      
      if (!optimizedImage) {
        console.error('Impossible de compresser suffisamment l\'image');
        alert("L'image est trop volumineuse. Veuillez choisir une image plus petite.");
        setIsUploading(false);
        return;
      }
      
      console.log('Image finalement optimisée, taille:', Math.round((optimizedImage.length * 0.75) / 1024), 'KB');
      
      // Construire les données à envoyer
      const personData = {
        firstName: data.firstName,
        lastName: data.lastName,
        photoUrl: optimizedImage
      };
      
      // Ajouter les autres champs seulement s'ils existent déjà
      if (data.birthDate) personData.birthDate = data.birthDate;
      if (data.birthPlace) personData.birthPlace = data.birthPlace;
      if (data.deathDate) personData.deathDate = data.deathDate;
      if (data.occupation) personData.occupation = data.occupation;
      if (data.biography) personData.biography = data.biography;
      if (data.gender) personData.gender = data.gender;
      
      console.log('Envoi des données de mise à jour pour la personne:', id, 
                'Champs inclus:', Object.keys(personData), 
                'Taille des données:', Math.round(JSON.stringify(personData).length / 1024), 'KB');
      
      // Mettre à jour la personne avec l'image optimisée
      const result = await updatePerson(id, personData);
      console.log('Résultat de la mise à jour:', result);
      
      if (!result.success) {
        throw new Error(result.message || "Erreur lors de la mise à jour");
      }
      
      console.log('Mise à jour réussie');
      
    } catch (error) {
      console.error("Erreur lors du traitement de l'image:", error);
      alert("Une erreur est survenue lors du traitement de l'image. Veuillez réessayer avec une image plus petite.");
    } finally {
      setIsUploading(false);
    }
  }, [id, updatePerson, data]);

  // Gérer le clic sur le nœud pour afficher/masquer les détails
  const handleNodeClick = useCallback((event) => {
    event.stopPropagation();
    setShowDetails(!showDetails);
  }, [showDetails]);

  // Calculer l'âge ou la durée de vie
  const getAgeOrLifespan = () => {
    // Adaptation du format de date entre les deux projets
    const birthYear = data.birthDate ? new Date(data.birthDate).getFullYear() : null;
    const deathYear = data.deathDate ? new Date(data.deathDate).getFullYear() : null;
    
    if (!birthYear) return null;
    
    const currentYear = new Date().getFullYear();
    if (deathYear) {
      const age = deathYear - birthYear;
      return `${birthYear} - ${deathYear} (${age} ans)`;
    } else {
      const age = currentYear - birthYear;
      return `Né(e) en ${birthYear} (${age} ans)`;
    }
  };

  // Vérifier si cette personne peut avoir un enfant de mariage
  const canAddChildToMarriage = useCallback(() => {
    // Trouver les liens de mariage dont cette personne fait partie
    const marriageEdges = edges.filter(edge => 
      (edge.source === id || edge.target === id) && 
      edge.data?.type === 'spouse_connection'
    );
    
    return marriageEdges.length > 0;
  }, [id, edges]);

  // Fonction pour gérer les actions de menu contextuel
  const handleContextMenuAction = useCallback((event, actionType) => {
    // Cette fonction sera implémentée dans le FamilyTreePage principal
    // Simuler l'événement pour le moment
    event.stopPropagation();
    console.log(`Action ${actionType} sur le nœud ${id}`);
  }, [id]);

  return (
    <motion.div
      className="person-node-wrapper relative"
      onClick={handleNodeClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
      style={{
        width: 150,
        height: showDetails ? 'auto' : 180
      }}
    >
      <div className={`node-content ${showDetails ? 'expanded' : ''}`}>
        <div className="node-image-container group relative">
          <label htmlFor={`file-upload-${id}`} className={`cursor-pointer w-full h-full ${isUploading ? 'opacity-50' : ''}`}>
            {data.photoUrl ? (
              <img 
                src={data.photoUrl} 
                alt={`${data.firstName} ${data.lastName}`} 
                className="node-image"
                onError={handleImageError}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-secondary">
                <User className="w-10 h-10 text-muted-foreground" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {isUploading ? (
                <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent"></div>
              ) : (
                <Edit3 className="w-6 h-6 text-white" />
              )}
            </div>
          </label>
        </div>
        <input 
          id={`file-upload-${id}`} 
          type="file" 
          accept="image/*" 
          onChange={handleImageUpload} 
          className="hidden"
          disabled={isUploading}
        />
        
        <p className="node-name text-sm max-w-[120px] truncate" title={`${data.firstName} ${data.lastName}`}>
          {`${data.firstName} ${data.lastName}`}
        </p>
        
        <AnimatePresence>
          {showDetails ? (
            <motion.div 
              className="node-details mt-2 text-xs space-y-1 max-w-[140px]"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              {getAgeOrLifespan() && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">{getAgeOrLifespan()}</span>
                </div>
              )}
              
              {data.birthPlace && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground truncate" title={data.birthPlace}>{data.birthPlace}</span>
                </div>
              )}
              
              {data.occupation && (
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground truncate" title={data.occupation}>{data.occupation}</span>
                </div>
              )}
              
              {data.biography && (
                <p className="text-muted-foreground line-clamp-3 italic" title={data.biography}>
                  {data.biography}
                </p>
              )}
            </motion.div>
          ) : (
            data.birthDate && (
              <p className="text-xs text-muted-foreground">{new Date(data.birthDate).getFullYear()}</p>
            )
          )}
        </AnimatePresence>
      </div>

      {/* Connecteurs pour les relations */}
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="react-flow__handle" />
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="react-flow__handle" />
      <Handle type="target" position={Position.Left} id="left-target" isConnectable={isConnectable} className="react-flow__handle !left-[-4px]" />
      <Handle type="source" position={Position.Left} id="left-source" isConnectable={isConnectable} className="react-flow__handle !left-[-4px]" />
      <Handle type="target" position={Position.Right} id="right-target" isConnectable={isConnectable} className="react-flow__handle !right-[-4px]" />
      <Handle type="source" position={Position.Right} id="right-source" isConnectable={isConnectable} className="react-flow__handle !right-[-4px]" />
      
      {/* Menu d'actions */}
      <AnimatePresence>
      {(showActions || selected) && !isUploading && (
        <motion.div 
          className="node-actions"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
        >
          <button className="action-button" title="Ajouter Parent" onClick={(e) => handleContextMenuAction(e, 'parent')}>
            <UserPlus className="h-4 w-4" />
          </button>
          <button className="action-button" title="Ajouter Conjoint(e)" onClick={(e) => handleContextMenuAction(e, 'spouse')}>
            <LinkIcon className="h-4 w-4" />
          </button>
          <button className="action-button" title="Ajouter Frère/Sœur" onClick={(e) => handleContextMenuAction(e, 'sibling')}>
            <Users className="h-4 w-4" />
          </button>
          <button className="action-button" title="Ajouter Enfant" onClick={(e) => handleContextMenuAction(e, 'child')}>
            <PlusCircle className="h-4 w-4" />
          </button>
          {canAddChildToMarriage() && (
            <button className="action-button" title="Enfant d'union" onClick={(e) => handleContextMenuAction(e, 'marriage_child')}>
              <Baby className="h-4 w-4" />
            </button>
          )}
          <button className="action-button" title="Modifier" onClick={(e) => handleContextMenuAction(e, 'edit')}>
            <Edit3 className="h-4 w-4" />
          </button>
          <button className="action-button" title="Supprimer" onClick={(e) => handleContextMenuAction(e, 'delete')}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </button>
        </motion.div>
      )}
      </AnimatePresence>
    </motion.div>
  );
};

export default memo(PersonNode);