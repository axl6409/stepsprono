import React, { useState, useContext } from 'react';
import {UserContext} from "../../contexts/UserContext.jsx";

const Rules = () => {
  const { user } = useContext(UserContext);
  const [accountInfo, setAccountInfo] = useState({
    username: user.username,
    email: user.email,
    // Autres champs d'informations du compte
  });
  const [settings, setSettings] = useState({
    // Déclarez ici les réglages de l'utilisateur (par exemple, préférences, options, etc.)
  });

  return (
    <div className="rules-container">
      <h2>Règlement des StepsProno</h2>
      <p className="font-sans text-sm text-black">
        StepsProno est un jeu de pronostics sportifs.
      </p>
    </div>
  );
};

export default Rules;
