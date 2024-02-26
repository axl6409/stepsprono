import React, {useEffect, useState} from 'react';
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const Trophies = ({user, token}) => {
  const [trophies, setTrophies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [earnedTrophies, setEarnedTrophies] = useState([]);

  useEffect(() => {
    const fetchTrophies = async () => {

    }

    const fetchEarnedTrophies = async () => {

    }
    if (user && token) {
      fetchTrophies();
      fetchEarnedTrophies();
    }
  }, [])

  return (
    <div>
      <h1>Trophées</h1>
    </div>
  )

}