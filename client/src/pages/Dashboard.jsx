import React, {useEffect, useState, useContext} from 'react';
import {UserContext} from "../contexts/UserContext.jsx";
import {Link, useParams} from "react-router-dom";
import {useCookies} from "react-cookie";
import axios from "axios";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
  faHourglassHalf,
  faPersonPraying, faTriangleExclamation
} from "@fortawesome/free-solid-svg-icons";
import CurrentBets from "./user/CurrentBets.jsx";
import Loader from "../components/partials/Loader.jsx";
import defaultTeamImage from "../assets/components/icons/hidden-trophy.webp";
import trophyIcon from "../assets/components/icons/icon-trophees.png";
import curveTextTrophies from "../assets/components/texts/les-trophees.svg";
import curveTextTeam from "../assets/components/texts/equipe-de-coeur.svg";
import heartRed from "../assets/components/register/step-3/heart-red.png";
import AlertModal from "../components/partials/modals/AlertModal.jsx";
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const Dashboard = ({ userId: propUserId }) => {
  const { user, isAuthenticated, updateUserStatus } = useContext(UserContext);
  const { userId: paramUserId } = useParams();
  const userId = paramUserId || propUserId;
  const [cookies, setCookie] = useCookies(["user"]);
  const [profileUser, setProfileUser] = useState(null);
  const token = localStorage.getItem('token') || cookies.token
  const [animateTitle, setAnimateTitle] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updateStatus, setUpdateStatus] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');

  useEffect(() => {
    const fetchProfileUser = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setProfileUser(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des données de l’utilisateur', error);
      }
    };
    if (userId) {
      fetchProfileUser()
    } else {
      setProfileUser(user)
    }
  }, [userId, user, token]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateTitle(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleRequestRoleUpdate = async () => {
    try {
      const response = await axios.patch(`${apiUrl}/api/user/${user.id}/request-role`, null,{
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (response.status === 200) {
        setUpdateStatus(true);
        setUpdateMessage('Demande envoyée !');
        setIsModalOpen(true)
        updateUserStatus('pending')
        setTimeout(function () {
          closeModal()
        }, 1500)
      } else {
        setUpdateStatus(false);
        setUpdateMessage('Erreur lors de l\'envoi de la demande');
        setIsModalOpen(true)
        updateUserStatus(null)
      }
    } catch (error) {
      setUpdateStatus(false);
      setUpdateMessage('Erreur lors de l\'envoi de la demande : ' + error);
      setIsModalOpen(true)
      updateUserStatus(null)
    }
  }

  const closeModal = () => {
    setUpdateStatus(false);
    setUpdateMessage('');
    setIsModalOpen(false);
  };

  if (!profileUser) {
    return (
      <div className="text-center flex flex-col justify-center">
        <span className="text-3xl font-black uppercase">Utilisateur introuvable</span>
      </div>
    );
  }

  const teamLogoUrl = profileUser.team?.logo_url;

  return (
    <div className="text-center relative flex flex-col justify-center">
      {isModalOpen && (
        <AlertModal message={updateMessage} type={updateStatus ? 'success' : 'error'} />
      )}
      <div className="flex flex-row justify-between px-4 py-2 mb-4">
        {userId === user.id ? (
          <Link
            className="relative block top-2 right-0 z-[60] w-[80px] h-[80px] before:content-[''] before:inline-block before:absolute before:z-[-1] before:inset-0 before:rounded-full before:bg-black before:border-black before:border-2 group"
            to={`/settings/team`}>
            <div
              className="relative w-full h-full transition -translate-y-1 -translate-x-0.5 group-hover:-translate-y-0 group-hover:-translate-x-0">
            <span
              className="absolute top-1.5 left-0 right-0 z-[4]">
              <img className="mx-auto" src={curveTextTeam} alt=""/>
            </span>
              <span
                className="block relative z-[3] w-full h-full border-2 border-black text-black p-2 pt-4 rounded-full text-center shadow-md bg-white">
              <img
                className="mx-auto h-full"
                src={profileUser.team_id ? `${apiUrl}/uploads/teams/${profileUser.team_id}/${teamLogoUrl}` : defaultTeamImage}
                alt=""/>
              <span className="w-[13px] h-[13px] rounded-full absolute left-0.5 top-1/2 -rotate-12">
                <img src={heartRed} alt=""/>
              </span>
              <span className="w-[13px] h-[13px] rounded-full absolute right-0.5 top-1/2 rotate-12">
                <img src={heartRed} alt=""/>
              </span>
            </span>
            </div>
          </Link>
        ) : (
          <div
            className="relative block top-2 right-0 z-[60] w-[80px] h-[80px] before:content-[''] before:inline-block before:absolute before:z-[-1] before:inset-0 before:rounded-full before:bg-black before:border-black before:border-2 group">
            <div
              className="relative w-full h-full transition -translate-y-1 -translate-x-0.5">
            <span
              className="absolute top-1.5 left-0 right-0 z-[4]">
              <img className="mx-auto" src={curveTextTeam} alt=""/>
            </span>
              <span
                className="block relative z-[3] w-full h-full border-2 border-black text-black p-2 pt-4 rounded-full text-center shadow-md bg-white">
              <img className="mx-auto h-full" src={apiUrl + "/uploads/teams/" + profileUser.team_id + "/" + teamLogoUrl}
                   alt=""/>
              <span className="w-[13px] h-[13px] rounded-full absolute left-0.5 top-1/2 -rotate-12">
                <img src={heartRed} alt=""/>
              </span>
              <span className="w-[13px] h-[13px] rounded-full absolute right-0.5 top-1/2 rotate-12">
                <img src={heartRed} alt=""/>
              </span>
            </span>
            </div>
          </div>
        )}
        <Link
          className="relative block top-2 right-0 z-[60] w-[80px] h-[80px] before:content-[''] before:inline-block before:absolute before:z-[-1] before:inset-0 before:rounded-full before:bg-black before:border-black before:border-2 group"
          to={`/rewards/${userId}`}>
          <div
            className="relative w-full h-full transition -translate-y-1 -translate-x-0.5 group-hover:-translate-y-0 group-hover:-translate-x-0">
            <span
              className="absolute top-1.5 left-0 right-0 z-[4]">
              <img className="mx-auto" src={curveTextTrophies} alt=""/>
            </span>
            <span
              className="block relative z-[3] w-full h-full border-2 border-black text-black p-2 pt-4 rounded-full text-center shadow-md bg-white">
              <img className="mx-auto" src={trophyIcon} alt=""/>
              <span className="w-[4px] h-[4px] bg-black rounded-full absolute left-1 top-1/2"></span>
              <span className="w-[4px] h-[4px] bg-black rounded-full absolute right-1 top-1/2"></span>
            </span>
          </div>
        </Link>
      </div>


      <h1
        className={`font-black my-8 mt-0 uppercase transition-all duration-500 ease-in-out relative w-fit mx-auto ${animateTitle ? 'title-animated' : 'text-base'}`}>{profileUser.username}
        <span
          className="absolute left-0 top-0 right-0 text-purple-soft z-[-1] transition-all opacity-0 duration-400 ease-in-out translate-x-0.5 translate-y-0.5">{profileUser.username}</span>
        <span
          className="absolute left-0 top-0 right-0 text-green-soft z-[-2] transition-all opacity-0 duration-300 ease-in-out translate-x-1 translate-y-1">{profileUser.username}</span>
      </h1>

      <div>
        {isAuthenticated && profileUser && profileUser.role !== 'visitor' ? (
          <>
            <CurrentBets loggedUser={user} user={profileUser} token={token}/>
          </>
        ) : (
          <>
            <div className="px-4">
              <p className="font-rubik font-base">Vous ête un <span className="font-bold">Visiteur</span></p>
              {profileUser.role === 'visitor' && user.status !== 'pending' && user.status !== 'refused' && user.status !== 'aproved' ? (
                <button
                  className="font-sans relative bg-green-light flex flex-row items-center text-center border border-black rounded-xl py-2 px-8 mx-auto my-4 transition-shadow duration-300 shadow-flat-black-adjust hover:shadow-none focus:shadow-none"
                  onClick={handleRequestRoleUpdate}
                >
                  <span className="font-roboto text-black text-sm font-medium leading-4">Devenir un Steps</span>
                  <span className="w-fit mx-auto relative">
                      <FontAwesomeIcon icon={faPersonPraying} className="text-black h-6 w-6 mx-auto ml-4 relative z-[2]"/>
                  </span>
                </button>
              ) : user.status === 'refused' ? (
                <p
                  className="font-sans w-fit relative bg-red-medium flex flex-row items-center text-center border border-black rounded-xl py-2 px-8 mx-auto my-4 transition-shadow duration-300 shadow-flat-black-adjust"
                >
                  <span className="font-roboto text-white text-xs leading-4">Demande <br/> refusée</span>
                  <span className="w-fit mx-auto relative">
                    <FontAwesomeIcon icon={faTriangleExclamation} className="text-white h-6 w-6 mx-auto ml-4 relative z-[2]"/>
                  </span>
                </p>
              ) : user.status === 'pending' ? (
                <p
                  className="font-sans w-fit relative bg-yellow-light flex flex-row items-center text-center border border-black rounded-xl py-2 px-8 mx-auto my-4 transition-shadow duration-300 shadow-flat-black-adjust"
                >
                  <span className="font-roboto text-black text-xs leading-4">Demande <br/> en attente</span>
                  <span className="w-fit mx-auto my-auto relative">
                    <FontAwesomeIcon icon={faHourglassHalf} className="text-black h-4 w-4 mx-auto ml-4 relative z-[2]"/>
                  </span>
                </p>
              ) : null}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
