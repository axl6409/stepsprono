import React from 'react';
import {Link} from "react-router-dom";


const Matchs = () => {
  return (
    <div className="text-center p-10 h-70vh flex flex-col justify-center">
      <h1 className="text-3xl font-bold mb-4">Matchs</h1>
      <div>
        <h2>Prochains Matchs</h2>
        <div>
          <ul>
            <li>Match 1</li>
            <li>Match 2</li>
            <li>Match 3</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Matchs;
