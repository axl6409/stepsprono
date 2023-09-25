import React, { useEffect, useState } from 'react';
import axios from 'axios'; // Supposons que vous utilisez axios pour les requêtes HTTP.

function TestComponent() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('http://127.0.0.1:3001/api/test')
      .then(response => {
        setMessage(response.data.message);
      })
      .catch(err => {
        setError('Erreur lors de la récupération du message: ' + err);
      });
  }, []);

  return (
    <div>
      {error ? (
        <p>{error}</p>
      ) : (
        <p>{message}</p>
      )}
    </div>
  );
}

export default TestComponent;
