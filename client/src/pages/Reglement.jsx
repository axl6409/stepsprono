// Reglement.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {Link} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCaretLeft} from "@fortawesome/free-solid-svg-icons";
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const Reglement = () => {
  const token = localStorage.getItem('token') || cookies.token
  const [reglement, setReglement] = useState('');

  useEffect(() => {
    const fetchReglement = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/app/reglement`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        const reglementData = response.data.options.Value;
        setReglement(reglementData);
      } catch (error) {
        console.error('Erreur lors de la récupération du règlement:', error);
      }
    };

    fetchReglement();
  }, []);

  return (
    <div className="reglement-container px-8">
      <div dangerouslySetInnerHTML={{ __html: reglement }} />
      <Link
        to="/dashboard"
        className="w-fit block relative my-12 ml-auto mr-8 before:content-[''] before:inline-block before:absolute before:z-[-1] before:inset-0 before:bg-green-lime before:border-black before:border-2 group"
      >
        <span className="relative z-[2] w-full block border-2 border-black text-black px-3 py-1 text-center shadow-md bg-white transition -translate-y-1 translate-x-1 group-hover:-translate-y-0 group-hover:-translate-x-0">
          Tableau de bord
        </span>
      </Link>
    </div>
  );
};

export default Reglement;
