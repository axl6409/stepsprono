import React, {useContext, useEffect, useState} from 'react';
import {Link, useNavigate} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
  faAngleLeft,
  faAngleRight,
  faAnglesLeft, faAnglesRight,
  faCirclePlus,
  faCircleXmark,
  faPen
} from "@fortawesome/free-solid-svg-icons";
import {UserContext} from "../contexts/UserContext.jsx";
import axios from "axios";
import ConfirmationModal from "../components/partials/ConfirmationModal.jsx";


const Matchs = () => {
  const { user, setUser } = useContext(UserContext)
  const [matchs, setMatchs] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const token = localStorage.getItem('token') || cookies.token
  const navigate = useNavigate()

  useEffect(() => {
    const fetchMatchs = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:3001/api/matches', {
          params: { page: currentPage, limit: itemsPerPage },
          headers: {
            'Authorization': `Bearer ${token}`, // remplacez `${token}` par le jeton JWT réel
          }
        });
        setMatchs(response.data.data);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error('Erreur lors de la récupération des matchs :', error);
      }
    }
    fetchMatchs()
  }, [currentPage, itemsPerPage]);

  return (
    <div className="text-center relative h-auto pt-16 flex flex-col justify-center">
      <h1 className="text-3xl font-bold mb-4">Matchs</h1>
      <div>
        <h2 className="font-title uppercase font-black bg-white w-fit h-[35px] mx-auto px-2.5 text-[22px] border-r-2 border-b-2 border-l-2 border-black rounded-br-md rounded-bl-md relative z-[5] bottom-[-35px] shadow-flat-black-adjust">Prochains Matchs</h2>
        <div className="relative pt-12 border-t-2 border-b-2 border-black overflow-hidden py-8 px-2 bg-flat-yellow">
          <ul className="flex flex-col justify-start">
            {matchs.map(match => (
              <li className="flex flex-row p-1.5 my-2 border-2 border-black rounded-l bg-white shadow-flat-black" key={match.id}>
                <div className="w-1/5 flex flex-col justify-center">
                  <img src={match.HomeTeam.logoUrl} alt={`${match.HomeTeam.name} Logo`} className="team-logo w-1/2 mx-auto"/>
                </div>
                <div className="w-1/5 flex flex-col justify-center">
                  <img src={match.AwayTeam.logoUrl} alt={`${match.AwayTeam.name} Logo`} className="team-logo w-1/2 mx-auto"/>
                </div>
                <div className="w-3/5 text-center flex flex-col justify-center px-6 py-2">
                  <p className="name font-sans text-base font-medium">{match.utcDate}</p>
                </div>
                <Link to={`/pronostic/${match.id}`} className="w-1/5 flex flex-col justify-center">
                  <FontAwesomeIcon icon={faPen} className="inline-block align-[-4px]" />
                </Link>
              </li>
            ))}
          </ul>
          <div className="pagination-buttons flex flex-row justify-center mt-4">
            <button
              className="group mx-4 w-[35px] h-[35px] flex flex-col justify-center text-center relative z-[5] cursor-pointer before:content-[''] before:absolute before:z-[2] before:bg-electric-blue before:inset-0 before:border-2 before:border-black"
              onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
            <span className="w-full h-full p-1 bg-white relative z-[3] translate-x-1 -translate-y-1 border-2 border-black transition duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-focus:translate-x-0 group-focus:translate-y-0">
              <FontAwesomeIcon icon={faAnglesLeft} className="mx-auto h-[25px] block" />
            </span>
            </button>
            <button
              className="group mx-4 w-[35px] h-[35px] flex flex-col justify-center text-center relative z-[5] cursor-pointer before:content-[''] before:absolute before:z-[2] before:bg-electric-blue before:inset-0 before:border-2 before:border-black"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
            <span className="w-full h-full p-1 bg-white relative z-[3] translate-x-1 -translate-y-1 border-2 border-black transition duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-focus:translate-x-0 group-focus:translate-y-0">
              <FontAwesomeIcon icon={faAngleLeft} className="mx-auto h-[25px] block" />
            </span>
            </button>
            <button
              className="group mx-4 w-[35px] h-[35px] flex flex-col justify-center text-center relative z-[5] cursor-pointer before:content-[''] before:absolute before:z-[2] before:bg-electric-blue before:inset-0 before:border-2 before:border-black"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
            <span className="w-full h-full p-1 bg-white relative z-[3] -translate-x-1 -translate-y-1 border-2 border-black transition duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-focus:translate-x-0 group-focus:translate-y-0">
              <FontAwesomeIcon icon={faAngleRight} className="mx-auto h-[25px] block" />
            </span>
            </button>
            <button
              className="group mx-4 w-[35px] h-[35px] flex flex-col justify-center text-center relative z-[5] cursor-pointer before:content-[''] before:absolute before:z-[2] before:bg-electric-blue before:inset-0 before:border-2 before:border-black"
              onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>
            <span className="w-full h-full p-1 bg-white relative z-[3] -translate-x-1 -translate-y-1 border-2 border-black transition duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-focus:translate-x-0 group-focus:translate-y-0">
              <FontAwesomeIcon icon={faAnglesRight} className="mx-auto h-[25px] block" />
            </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Matchs;
