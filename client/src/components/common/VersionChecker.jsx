import { useEffect, useState } from 'react';
import { startVersionCheck, stopVersionCheck } from '../../services/versionService';
import { useUpdate } from '../../contexts/UpdateContext';

/**
 * Composant qui vérifie périodiquement les mises à jour de l'application
 * et affiche une notification quand une nouvelle version est disponible.
 */
const VersionChecker = () => {
  const { showUpdate } = useUpdate();

  useEffect(() => {
    // Démarrer la surveillance des mises à jour
    startVersionCheck(({ latestVersion, currentVersion }) => {
      showUpdate({
        hasUpdate: true,
        currentVersion,
        latestVersion,
        needsRefresh: true
      });
    });

    // Nettoyer à la suppression du composant
    return () => {
      stopVersionCheck();
    };
  }, [showUpdate]);

  return null; // Ce composant ne rend rien
};

export default VersionChecker;
