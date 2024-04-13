import React, { useState } from 'react';

const StepThree = ({ onPrevious, onFinish }) => {
  const [team, setTeam] = useState('');

  return (
    <div className="step-three-container">
      <button onClick={onPrevious}>Retour</button>
      <h1>Choisissez votre équipe</h1>
      <form onSubmit={(e) => {
        e.preventDefault();
        onFinish(team);
      }}>
        <select onChange={(e) => setTeam(e.target.value)} required>
          <option value="">Sélectionnez une équipe</option>
          {/* Assurez-vous de remplir les options avec les données réelles des équipes */}
          <option value="team1">Équipe 1</option>
          <option value="team2">Équipe 2</option>
        </select>
        {team && <img src={`path_to_logo/${team}.png`} alt="Logo de l'équipe" />}
        <button type="submit">S'inscrire</button>
      </form>
    </div>
  );
};

export default StepThree;
