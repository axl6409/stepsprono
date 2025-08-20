import React, { useEffect, useState } from 'react';
import { useUpdate } from '../../contexts/UpdateContext';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRotateRight, faSpinner } from "@fortawesome/free-solid-svg-icons";

const UpdateModal = () => {
  const { showUpdateModal, hideUpdate, updateInfo } = useUpdate();
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateComplete, setUpdateComplete] = useState(false);

  useEffect(() => {
    // Réinitialiser l'état lorsque la modale est ouverte
    if (showUpdateModal) {
      setIsUpdating(false);
      setUpdateComplete(false);
    }
  }, [showUpdateModal]);

  const handleUpdate = async () => {
    if (!('serviceWorker' in navigator)) {
      window.location.reload();
      return;
    }

    setIsUpdating(true);
    
    try {
      // Vérifier s'il y a un service worker en attente
      const registration = await navigator.serviceWorker.getRegistration();
      
      if (registration && registration.waiting) {
        // Envoyer un message au service worker en attente pour qu'il s'active
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        
        // Écouter l'événement de contrôleur change pour recharger la page
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          window.location.reload();
        });
      } else {
        // Si pas de service worker en attente, recharger normalement
        window.location.reload();
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour :', error);
      window.location.reload();
    }
  };

  if (!showUpdateModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="absolute z-[9] fade-in inset-0 h-full w-full bg-gray-600 bg-clip-padding backdrop-filter backdrop-blur-[4px] bg-opacity-40"></div>
      <div className="relative z-[10] bg-white rounded-lg py-6 px-4 max-w-md w-full shadow-lg border-2 border-black">
        <div className="text-center">
          <h2 className="font-rubik uppercase text-xl leading-5 text-black font-bold mb-4 px-8">
            {isUpdating ? 'Mise à jour en cours...' : 'Mise à jour disponible'}
          </h2>
          
          {!isUpdating ? (
            <>
              <p className="font-rubik text-sm text-black mb-4">
                Une nouvelle version de l'application est disponible. Voulez-vous l'installer maintenant ?
              </p>
              <div className="font-roboto text-xs text-gray-600 mb-6">
                {console.log(updateInfo)}
                <span className="text-red-medium">Version actuelle: {updateInfo.currentVersion}</span> → <br />
                <span className="text-green-lime-deep">Nouvelle version: {updateInfo.latestVersion}</span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-4">
              <FontAwesomeIcon 
                icon={faSpinner} 
                className="animate-spin text-2xl text-blue-medium mb-4"
              />
              <p className="font-roboto text-sm text-base text-black">Installation de la mise à jour...</p>
            </div>
          )}
          
          {!isUpdating && (
            <div className="flex justify-center gap-4">
              <button
                onClick={hideUpdate}
                className="font-rubik text-xs leading-4 px-4 py-2 border-2 border-black rounded-md hover:bg-grey-light transition-colors"
                disabled={isUpdating}
              >
                Plus tard
              </button>
              <button
                onClick={handleUpdate}
                className="font-rubik text-sm leading-5 px-4 py-2 bg-blue-medium text-white rounded-md hover:bg-blue-light transition-colors flex items-center gap-2"
                disabled={isUpdating}
              >
                <FontAwesomeIcon icon={faArrowRotateRight} />
                Mettre à jour maintenant
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpdateModal;
