import React, {useContext, useEffect, useState} from 'react';
import {Link, useNavigate} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCirclePlus, faCircleXmark, faPen} from "@fortawesome/free-solid-svg-icons";
import {UserContext} from "../contexts/UserContext.jsx";
import axios from "axios";


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
  console.log(matchs);
  return (
    <div className="text-center relative h-70vh flex flex-col justify-center">
      {user && user.role === 'admin' && (
        <button
          className="group w-fit px-2.5 py-0.5 bg-white absolute -top-2 right-4 shadow-flat-black-adjust border-2 border-black rounded-br-xl rounded-bl-xl font-title text-l uppercase font-bold"
          onClick={() => navigate('/matchs/edit', { state: { mode: 'add' } })}>
          <span className="mr-2">Ajouter un match</span>
          <FontAwesomeIcon icon={faCirclePlus} className="inline-block align-[-4px]" />
        </button>
      )}
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
                  <p className="name font-sans text-base font-medium">{match.date}</p>
                </div>
                <div className="w-1/5 flex flex-col justify-evenly">
                  {user && user.role === 'admin' && (
                    <>
                      <button
                        className="w-fit h-[30px] block relative mx-auto my-1 before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-x-0 before:inset-y-px before:bg-green-lime before:border-black before:border-2 group"
                        >
                        <FontAwesomeIcon icon={faPen} className="relative z-[2] w-fit block border-2 border-black text-black px-3 py-1 text-center shadow-md bg-white transition -translate-y-1 translate-x-1 group-hover:-translate-y-0 group-hover:-translate-x-0" />
                      </button>
                      <button
                        className="w-fit h-[30px] block relative mx-auto my-1 before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-x-0 before:inset-y-px before:bg-flat-red before:border-black before:border-2 group"
                        >
                        <FontAwesomeIcon icon={faCircleXmark} className="relative z-[2] w-fit block border-2 border-black text-black px-3 py-1 text-center shadow-md bg-white transition -translate-y-1 translate-x-1 group-hover:-translate-y-0 group-hover:-translate-x-0" />
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Matchs;
