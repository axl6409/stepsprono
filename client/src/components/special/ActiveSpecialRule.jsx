import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';

const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const ActiveSpecialRule = () => {
  const [cookies] = useCookies(['token']);
  const token = localStorage.getItem('token') || cookies.token;
  const [activeRule, setActiveRule] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActiveRule = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/special-rule/active`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.data.rule) {
          setActiveRule(response.data.rule);
        }
      } catch (err) {
        console.error("Erreur lors du chargement de la règle active:", err);
        setError("Impossible de charger la journée spéciale active");
      } finally {
        setIsLoading(false);
      }
    };

    fetchActiveRule();
  }, [token]);

  if (isLoading) return null; // Ne rien afficher pendant le chargement
  if (error) return null; // Ne rien afficher en cas d'erreur
  if (!activeRule) return null; // Ne rien afficher s'il n'y a pas de règle active

  // Formater la date d'activation
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Vérifier si la règle est active maintenant
  const isActiveNow = activeRule.status === 'active' && 
    (!activeRule.activation_date || new Date(activeRule.activation_date) <= new Date());

  if (!isActiveNow) return null; // Ne rien afficher si la règle n'est pas active maintenant

  return (
    <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 rounded-r-lg p-4 mb-6">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg 
            className="h-8 w-8 text-blue-500" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M13 10V3L4 14h7v7l9-11h-7z" 
            />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-lg font-medium text-blue-800">{activeRule.name}</h3>
          {activeRule.config?.description && (
            <p className="text-sm text-blue-700 mt-1">{activeRule.config.description}</p>
          )}
          {activeRule.activation_date && (
            <p className="text-xs text-blue-600 mt-1">
              Active jusqu'à {formatDate(activeRule.activation_date)}
            </p>
          )}
          
          {activeRule.config?.selectedUser && (
            <div className="mt-2 flex items-center">
              <span className="text-sm font-medium text-blue-900 mr-2">Cible du jour :</span>
              <div className="flex items-center bg-blue-50 px-2 py-1 rounded-full border border-blue-200">
                {activeRule.config.selectedUser.avatar ? (
                  <img 
                    src={activeRule.config.selectedUser.avatar} 
                    alt={activeRule.config.selectedUser.username}
                    className="h-6 w-6 rounded-full mr-2"
                  />
                ) : (
                  <div className="h-6 w-6 rounded-full bg-blue-200 flex items-center justify-center text-blue-800 text-xs font-bold mr-2">
                    {activeRule.config.selectedUser.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-sm font-medium text-blue-800">
                  {activeRule.config.selectedUser.username}
                </span>
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Cible
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActiveSpecialRule;
