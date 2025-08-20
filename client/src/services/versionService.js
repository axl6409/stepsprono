import axios from '../axios';
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

// Clé pour stocker la version dans le localStorage
const STORAGE_KEY = 'app_version';

// Récupérer ou initialiser la version dans le localStorage
const getStoredVersion = () => {
  return localStorage.getItem(STORAGE_KEY);
};

// Sauvegarder la version dans le localStorage
const saveVersion = (version) => {
  localStorage.setItem(STORAGE_KEY, version);
};

// Intervalle de vérification de la version (en millisecondes)
const VERSION_CHECK_INTERVAL = 5 * 60 * 1000; // Toutes les 5 minutes

let versionCheckInterval = null;

/**
 * Vérifie si une nouvelle version de l'application est disponible
 * @returns {Promise<{hasUpdate: boolean, currentVersion: string, latestVersion: string, needsRefresh?: boolean}>}
 */
export const checkForUpdates = async () => {
  try {
    const response = await axios.get(`${apiUrl}/api/app/version`);
    const { clientVersion: latestVersion } = response.data.data;
    const currentVersion = getStoredVersion();
    
    // Si c'est la première fois ou si la version a changé
    if (!currentVersion || currentVersion !== latestVersion) {
      const previousVersion = currentVersion;
      saveVersion(latestVersion);
      
      // Si c'est une mise à jour (et non la première visite), on indique qu'il faut recharger
      if (previousVersion && previousVersion !== latestVersion) {
        return {
          hasUpdate: true,
          currentVersion: previousVersion,
          latestVersion,
          needsRefresh: true
        };
      }
    }
    
    return {
      hasUpdate: currentVersion ? currentVersion !== latestVersion : false,
      currentVersion: currentVersion || latestVersion,
      latestVersion
    };
  } catch (error) {
    console.error('Erreur lors de la vérification des mises à jour :', error);
    return {
      hasUpdate: false,
      currentVersion: getStoredVersion() || '1.0.0',
      latestVersion: getStoredVersion() || '1.0.0',
      error: error.message
    };
  }
};

/**
 * Démarre la surveillance des mises à jour
 * @param {Function} onUpdateAvailable - Callback appelé quand une mise à jour est disponible
 */
export const startVersionCheck = (onUpdateAvailable) => {
  // Vérifier immédiatement
  checkForUpdates().then(({ hasUpdate, currentVersion, latestVersion, needsRefresh }) => {
    if (hasUpdate && needsRefresh) {
      onUpdateAvailable({ currentVersion, latestVersion });
    }
  });

  // Puis vérifier périodiquement
  versionCheckInterval = setInterval(async () => {
    const { hasUpdate, currentVersion, latestVersion, needsRefresh } = await checkForUpdates();
    if (hasUpdate && needsRefresh) {
      onUpdateAvailable({ currentVersion, latestVersion });
    }
  }, VERSION_CHECK_INTERVAL);
};

/**
 * Arrête la surveillance des mises à jour
 */
export const stopVersionCheck = () => {
  if (versionCheckInterval) {
    clearInterval(versionCheckInterval);
    versionCheckInterval = null;
  }
};

/**
 * Vérifie les mises à jour et notifie si nécessaire
 * @returns {Promise<{hasUpdate: boolean, currentVersion: string, latestVersion: string, needsRefresh?: boolean}>}
 */
export const checkAndNotifyUpdate = async () => {
  return checkForUpdates();
};
