import React, {useContext, useEffect, useState} from 'react';
import {Link, useNavigate} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {UserContext} from "../contexts/UserContext.jsx";
import axios from "axios";
import ConfirmationModal from "../components/partials/ConfirmationModal.jsx";

const Bets = () => {
  const {user, setUser} = useState(useContext)
  const [bets, setBets] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [betToDelete, setBetToDelete] = useState(null)
  const [totalPages, setTotalPages] = useState(0)
  const token = localStorage.getItem('token') || cookies.token
  const navigate = useNavigate()

  useEffect(() => {
    const fetchBets = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:3001/api/bets', {
          params: { page: currentPage, limit: itemsPerPage },
          headers: {
            'Authorization': `Bearer ${token}`, // remplacez `${token}` par le jeton JWT réel
          }
        });
        setBets(response.data.data);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error('Erreur lors de la récupération des paris :', error);
      }
    }
    fetchBets()
  }, [currentPage, itemsPerPage]);
}