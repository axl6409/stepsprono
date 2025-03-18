import React, {useContext, useEffect, useState} from 'react';
import moment from 'moment';
import {Link, useNavigate} from "react-router-dom";
import {UserContext} from "../contexts/UserContext.jsx";
import Week from "../components/matchs/Week.jsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCaretLeft} from "@fortawesome/free-solid-svg-icons";
import arrowIcon from "../assets/icons/arrow-left.svg";
import Passed from "../components/matchs/Passed.jsx";
import {useCookies} from "react-cookie";
import AnimatedTitle from "../components/partials/AnimatedTitle.jsx";
import Pronostic from "../components/matchs/Pronostic.jsx";
import axios from "axios";
import DashboardButton from "../components/nav/DashboardButton.jsx";
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const Matchs = () => {
  const { user, setUser } = useContext(UserContext)
  const [cookies, setCookie] = useCookies(["user"]);
  const [matchs, setMatchs] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [canDisplayBets, setCanDisplayBets] = useState(true);
  const token = localStorage.getItem('token') || cookies.token
  const navigate = useNavigate()

  useEffect(() => {
    const fetchMatchs = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/matchs/current-week`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        const sortedMatchs = response.data.data;
        if (sortedMatchs.length === 0) {
          navigate('/dashboard');
          return;
        }
        setMatchs(sortedMatchs);

        const firstMatchDate = moment(sortedMatchs[0].utc_date);
        const lastMatchDate = moment(sortedMatchs[sortedMatchs.length - 1].utc_date);
        const firstMatchDeadline = firstMatchDate.clone().set({ hour: 12, minute: 0, second: 0 });
        const lastMatchDeadline = lastMatchDate.clone().set({ hour: 23, minute: 59, second: 59 });

        const now = moment();

        if (now.isBetween(firstMatchDeadline, lastMatchDeadline)) {
          setCanDisplayBets(false);
          navigate('/dashboard');
        } else {
          setCanDisplayBets(true);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des matchs :', error);
      }
    };
    fetchMatchs();
  }, [currentPage, itemsPerPage, navigate, token]);

  return (
    <div className="text-center relative h-auto flex flex-col justify-center overflow-x-hidden py-12">
      <DashboardButton />
      <AnimatedTitle title={"Pronostics"} stickyStatus={false}/>
      <div className="px-4 relative">
        <Week token={token} user={user}/>
      </div>
    </div>
  );
}

export default Matchs
