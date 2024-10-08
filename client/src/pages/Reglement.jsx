// Reglement.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {Link} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCaretLeft} from "@fortawesome/free-solid-svg-icons";
import {useCookies} from "react-cookie";
import AnimatedTitle from "../components/partials/AnimatedTitle.jsx";
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const Reglement = () => {
  const [cookies, setCookie] = useCookies(["user"]);
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
    <div className="reglement-container px-8 py-12">
      <AnimatedTitle title={"RÈGLEMENT INTÉRIEUR"} />
      <div translate="no" className="my-12" dangerouslySetInnerHTML={{__html: reglement}}/>
      <Link
        to="/dashboard"
        className="w-4/5 block relative my-4 mx-auto before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-black before:border-black before:border group"
      >
        <span
          translate="no"
          className="relative z-[2] w-full block border border-black text-black uppercase font-regular text-l font-roboto px-3 py-2 rounded-full text-center shadow-md bg-blue-light transition -translate-y-1.5 group-hover:-translate-y-0"
        >
          J'accepte
        </span>
      </Link>
    </div>
  );
};

export default Reglement;
