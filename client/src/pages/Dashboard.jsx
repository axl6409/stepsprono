import React, {useEffect, useState, useContext} from 'react';
import {UserContext} from "../contexts/UserContext.jsx";
import {Link, useParams} from "react-router-dom";
import futbol from "/img/futbol-solid.svg";
import {useCookies} from "react-cookie";
import axios from "axios";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faChevronDown, faHourglassHalf, faPersonPraying} from "@fortawesome/free-solid-svg-icons";
import CurrentBets from "./user/CurrentBets.jsx";
import Loader from "../components/partials/Loader.jsx";
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const Dashboard = () => {
  const { user, isAuthenticated } = useContext(UserContext);
  const [cookies, setCookie] = useCookies(["user"]);
  const [profileUser, setProfileUser] = useState(null);
  const token = localStorage.getItem('token') || cookies.token
  const { userId } = useParams()
  const [isLoading, setIsLoading] = useState(true);
  const [animateTitle, setAnimateTitle] = useState(false);

  useEffect(() => {
    const fetchProfileUser = async () => {
      setIsLoading(true)
      try {
        const response = await axios.get(`${apiUrl}/api/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setProfileUser(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des données de l’utilisateur', error);
      } finally {
        setIsLoading(false)
      }
    };
    if (userId) {
      fetchProfileUser()
    } else {
      setProfileUser(user)
      setIsLoading(false)
    }
  }, [userId, user, token]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateTitle(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="text-center flex flex-col justify-center">
        <Loader />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="text-center flex flex-col justify-center">
        <span className="text-3xl font-black uppercase">Utilisateur introuvable</span>
      </div>
    );
  }

  return (
    <div className="text-center relative py-10 flex flex-col justify-center">
      <span className="absolute top-10 left-4 text-xl text-black">
        <img className="w-[30px]" src={futbol} alt="football icon"/>
      </span>
      <span className="absolute top-10 right-4 text-xl text-black">
        <img className="w-[30px]" src={futbol} alt="football icon"/>
      </span>
      <h1 className="text-3xl font-black my-8 mt-0 uppercase relative w-fit mx-auto">Steps Prono
        <span
          className="absolute left-0 bottom-0 text-flat-purple z-[-1] transition-all duration-700 ease-in-out delay-500 -translate-x-0.5 translate-y-0.5">Steps Prono</span>
        <span
          className="absolute left-0 bottom-0 text-green-lime z-[-2] transition-all duration-700 ease-in-out delay-700 -translate-x-1 translate-y-1">Steps Prono</span>
      </h1>
      <h2 className={`font-black my-8 mt-0 uppercase transition-all duration-500 ease-in-out relative w-fit mx-auto ${animateTitle ? 'title-animated' : 'text-base'}`}>{profileUser.username}
        <span
          className="absolute left-0 top-0 right-0 text-flat-purple z-[-1] transition-all opacity-0 duration-400 ease-in-out -translate-x-0.5 translate-y-0.5">{profileUser.username}</span>
        <span
          className="absolute left-0 top-0 right-0 text-green-lime z-[-2] transition-all opacity-0 duration-300 ease-in-out -translate-x-1 translate-y-1">{profileUser.username}</span>
      </h2>

      <div>
        {isAuthenticated && profileUser && profileUser.role !== 'visitor' ? (
          <>
            <CurrentBets user={profileUser} token={token}/>
          </>
        ) : (
          <>
            <div className="">
              <p className="font-sans font-base">Vous ête un <span className="font-bold">Visiteur</span></p>
              <Link
                to="/user/settings"
                className="w-3/4 block mx-auto relative my-4 before:content-[''] before:inline-block before:absolute before:z-[-1] before:inset-0 before:rounded-full before:bg-green-lime before:border-black before:border-2 group"
              >
                <span
                  className="relative z-[2] w-full block border-2 border-black text-black px-3 py-2 rounded-full text-center text-xs shadow-md bg-white transition -translate-y-2.5 group-hover:-translate-y-0">Devenir membre <FontAwesomeIcon
                  icon={faPersonPraying}/></span>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
