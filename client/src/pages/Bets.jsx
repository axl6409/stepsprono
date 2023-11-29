import React, {useContext, useEffect, useState} from 'react';
import {Link, useNavigate, useParams} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {UserContext} from "../contexts/UserContext.jsx";
import axios from "axios";
import ConfirmationModal from "../components/partials/ConfirmationModal.jsx";
import {faCircleXmark, faPen} from "@fortawesome/free-solid-svg-icons";
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const Bets = () => {
  const { user } = useContext(UserContext)
  const [bets, setBets] = useState([])
  const { matchId } = useParams()
  const token = localStorage.getItem('token') || cookies.token
  const navigate = useNavigate()

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/match/${matchId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        setBets(response.data.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des paris :', error);
      }
    }
    fetchMatch()
  });

  return (
    <div className="text-center relative h-auto pt-16 flex flex-col justify-center">
      <h1 className="text-3xl font-bold mb-4">Pronostic</h1>
      <div>

      </div>
    </div>
  )
}

export default Bets;