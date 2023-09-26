import React, { useState, useContext } from 'react';
import {UserContext} from "../../contexts/UserContext.jsx";

const Settings = () => {
  const { user } = useContext(UserContext); // Récupérez l'utilisateur actuellement connecté depuis le contexte

  // Déclarez ici les états pour les informations du compte et les réglages de l'utilisateur
  const [accountInfo, setAccountInfo] = useState({
    username: user.username,
    email: user.email,
    // Autres champs d'informations du compte
  });

  const [settings, setSettings] = useState({
    // Déclarez ici les réglages de l'utilisateur (par exemple, préférences, options, etc.)
  });

  // Ajoutez des gestionnaires d'événements pour mettre à jour les états lorsque l'utilisateur interagit avec le formulaire

  return (
    <div className="settings-container">
      <h2>Paramètres du compte</h2>
      <form onSubmit={handleAccountInfoSubmit}>
        {/* Formulaire pour les informations du compte */}
        {/* Utilisez les états accountInfo pour les valeurs des champs */}
        <input type="text" name="username" value={accountInfo.username} onChange={handleAccountInfoChange} />
        <input type="email" name="email" value={accountInfo.email} onChange={handleAccountInfoChange} />
        {/* Autres champs d'informations du compte */}
        <button type="submit">Mettre à jour</button>
      </form>

      <h2>Paramètres</h2>
      <form onSubmit={handleSettingsSubmit}>
        {/* Formulaire pour les réglages */}
        {/* Utilisez les états settings pour les valeurs des champs */}
        {/* Par exemple, des cases à cocher pour les préférences utilisateur */}
        {/* <input type="checkbox" name="option1" checked={settings.option1} onChange={handleSettingsChange} /> */}
        {/* Autres champs de réglages */}
        <button type="submit">Enregistrer</button>
      </form>
    </div>
  );
};

export default Settings;
