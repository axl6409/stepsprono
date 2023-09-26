// Teams.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Teams = () => {
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    const apiKey = '2769f51fcff836675f925a6bbfb5f9cf'
    const apiUrl = 'https://v3.football.api-sports.io/football/teams'


  }, []);
  return (
    <div>
      <h1>Équipes de football françaises</h1>
      <ul>
        <li>liste des clubs</li>
      </ul>
    </div>
  );
}

export default Teams;
