import React, {useEffect, useState, useContext} from 'react';
import {UserContext} from "../contexts/UserContext.jsx";
import {Link, useParams, useNavigate} from "react-router-dom";
import {useCookies} from "react-cookie";
import axios from "axios";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
  faHourglassHalf,
  faPersonPraying, faTriangleExclamation
} from "@fortawesome/free-solid-svg-icons";
import { useSwipeable } from "react-swipeable";
import CurrentBets from "./user/CurrentBets.jsx";
import Loader from "../components/partials/Loader.jsx";
import defaultTeamImage from "../assets/components/icons/hidden-trophy.webp";
import trophyIcon from "../assets/components/icons/icon-trophees.png";
import curveTextTrophies from "../assets/components/texts/les-trophees.svg";
import curveTextTeam from "../assets/components/texts/equipe-de-coeur.svg";
import heartRed from "../assets/components/register/step-3/heart-red.png";
import AlertModal from "../components/partials/modals/AlertModal.jsx";
import AnimatedTitle from "../components/partials/AnimatedTitle.jsx";
import {RankingContext} from "../contexts/RankingContext.jsx";
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const Dashboard = ({ userId: propUserId }) => {
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated, updateUserStatus } = useContext(UserContext);
  const { ranking, rankingType, fetchRanking, isLoading: rankingIsLoading } = useContext(RankingContext);
  const { userId: paramUserId } = useParams();
  const userId = paramUserId || propUserId;
  const [cookies, setCookie] = useCookies(["user"]);
  const [profileUser, setProfileUser] = useState(null);
  const token = localStorage.getItem('token') || cookies.token;
  const [animateTitle, setAnimateTitle] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updateStatus, setUpdateStatus] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  const [currentUserIndex, setCurrentUserIndex] = useState(null);
  const navigate = useNavigate();


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
      } finally {
        setIsLoading(false);
      }
    };
    const updateLastConnected = async () => {
      try {
        const userId = user.id;
        await axios.patch(`${apiUrl}/api/user/${userId}/last-connect`, null, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      } catch (error) {
        console.error('Erreur lors de la mise à jour de la date de connexion', error);
      }
    };
    if (isAuthenticated && (userId === user.id)) {
      updateLastConnected()
    }
    if (userId) {
      fetchProfileUser();
    } else {
      setProfileUser(user);
      setIsLoading(false);
    }
  }, [userId, user, token]);


  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateTitle(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);


  useEffect(() => {
    if (!ranking.length && !rankingIsLoading) {
      fetchRanking(rankingType);
    }
    if (ranking.length > 0 && !rankingIsLoading) {
      const index = ranking.findIndex(u => u.user_id === parseInt(userId));
      setCurrentUserIndex(index);
    }
  }, [ranking, rankingType, userId, fetchRanking, rankingIsLoading]);


  const goToNextUser = () => {
    if (currentUserIndex !== null && currentUserIndex < ranking.length - 1) {
      const nextUserId = ranking[currentUserIndex + 1].user_id;
      navigate(`/dashboard/${nextUserId}`);
    }
  };

  const getColorClass = (index, totalUsers) => {
    if (index === 0) {
      return 'text-bright-yellow';
    }

    const firstQuart = Math.floor(totalUsers / 3);
    const secondQuart = firstQuart * 2;

    if (index < firstQuart) {
      return 'text-green-medium';
    } else if (index < secondQuart) {
      return 'text-orange-medium';
    } else {
      return 'text-red-medium';
    }
  };

  const goToPreviousUser = () => {
    if (currentUserIndex > 0) {
      const previousUserId = ranking[currentUserIndex - 1].user_id;
      navigate(`/dashboard/${previousUserId}`);
    }
  };

  const handleRequestRoleUpdate = async () => {
    try {
      const response = await axios.patch(`${apiUrl}/api/user/${user.id}/request-role`, null, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (response.status === 200) {
        setUpdateStatus(true);
        setUpdateMessage('Demande envoyée !');
        setIsModalOpen(true);
        updateUserStatus('pending');
        setTimeout(function () {
          closeModal();
        }, 1500);
      } else {
        setUpdateStatus(false);
        setUpdateMessage('Erreur lors de l\'envoi de la demande');
        setIsModalOpen(true);
        updateUserStatus(null);
      }
    } catch (error) {
      setUpdateStatus(false);
      setUpdateMessage('Erreur lors de l\'envoi de la demande : ' + error);
      setIsModalOpen(true);
      updateUserStatus(null);
    }
  };

  const closeModal = () => {
    setUpdateStatus(false);
    setUpdateMessage('');
    setIsModalOpen(false);
  };

  const handlers = useSwipeable({
    onSwipedLeft: goToNextUser,
    onSwipedRight: goToPreviousUser,
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  });

  if (isLoading || rankingIsLoading) {
    return (
      <div className="text-center flex flex-col justify-center">
        <Loader />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="text-center flex flex-col justify-center">
        <span className="text-3xl no-correct font-black uppercase">Utilisateur introuvable</span>
      </div>
    );
  }

  const teamLogoUrl = profileUser.team?.logo_url;

  return (
    <div {...handlers} className="text-center relative flex flex-col justify-center overflow-x-hidden" key={userId}>
      {isModalOpen && (
        <AlertModal message={updateMessage} type={updateStatus ? 'success' : 'error'}/>
      )}
      <div className="flex flex-row justify-between px-4 py-2 mb-4">
        {userId === user.id ? (
          <Link
            className="relative fade-in block bg-white rounded-full top-2 right-0 z-[60] w-[80px] h-[80px] before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-black before:border-black before:border-2 group"
            to={`/settings/team`}>
            <div
              className="relative z-[2] w-full h-full transition -translate-y-1 -translate-x-0.5 group-hover:-translate-y-0 group-hover:-translate-x-0">
              <span className="absolute no-correct top-1.5 left-0 right-0 z-[4]">
                <img className="mx-auto" src={curveTextTeam} alt=""/>
              </span>
              <span
                className="block relative z-[3] w-full h-full border-2 border-black text-black p-2 pt-4 rounded-full text-center shadow-md bg-white">
                <img className="mx-auto h-full"
                     src={profileUser.team_id ? `${apiUrl}/uploads/teams/${profileUser.team_id}/${teamLogoUrl}` : defaultTeamImage}
                     alt=""/>
              </span>
            </div>
          </Link>
        ) : (
          <div
            className="relative fade-in block bg-white rounded-full top-2 right-0 z-[60] w-[80px] h-[80px] before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-black before:border-black before:border-2 group">
            <div className="relative z-[2] w-full h-full transition -translate-y-1 -translate-x-0.5">
              <span className="absolute top-1.5 no-correct left-0 right-0 z-[4]">
                <img className="mx-auto" src={curveTextTeam} alt=""/>
              </span>
              <span
                className="block relative z-[3] w-full h-full border-2 border-black text-black p-2 pt-4 rounded-full text-center shadow-md bg-white">
                <img className="mx-auto h-full"
                     src={apiUrl + "/uploads/teams/" + profileUser.team_id + "/" + teamLogoUrl} alt=""/>
              </span>
            </div>
          </div>
        )}
        <div>
          <p translate="no"  className="fade-in">
            <span className="block text-black uppercase font-bold text-xs font-roboto">Position</span>
          </p>
          <p translate="no"  className="relative fade-in">
            <span className="absolute inset-0 translate-x-0.5 translate-y-0.5 font-rubik text-xl4 stroke-black font-black leading-8">{currentUserIndex !== null ? currentUserIndex + 1 : 'Non classé'}</span>
            <span
              className={`block relative z-[10] font-rubik text-xl4 stroke-black font-black leading-8 ${getColorClass(currentUserIndex, ranking.length)}`}>
              {currentUserIndex !== null ? currentUserIndex + 1 : 'Non classé'}
            </span>
          </p>
        </div>
        <Link
          className="relative fade-in block bg-white rounded-full top-2 right-0 z-[60] w-[80px] h-[80px] before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-black before:border-black before:border-2 group"
          to={`/rewards/${userId}`}>
          <div
            className="relative z-[2] w-full h-full transition -translate-y-1 -translate-x-0.5 group-hover:-translate-y-0 group-hover:-translate-x-0">
            <span className="absolute no-correct top-1.5 left-0 right-0 z-[4]">
              <img className="mx-auto" src={curveTextTrophies} alt=""/>
            </span>
            <span
              className="block relative z-[3] w-full h-full border-2 border-black text-black p-2 pt-4 rounded-full text-center shadow-md bg-white">
              <img className="mx-auto" src={trophyIcon} alt=""/>
            </span>
          </div>
        </Link>
      </div>

      <AnimatedTitle title={profileUser.username} stickyStatus={false}/>

      <div>
        {isAuthenticated && profileUser && profileUser.role !== 'visitor' ? (
          <CurrentBets loggedUser={user} user={profileUser} token={token}/>
        ) : (
          <div className="px-4 fade-in">
            <p translate="no" className="font-rubik no-correct font-base">
              Vous ête un <span className="font-bold">Visiteur</span>
            </p>
            {profileUser.role === 'visitor' && user.status !== 'pending' && user.status !== 'refused' && user.status !== 'aproved' ? (
              <button
                translate="no"
                className="font-sans relative bg-green-light flex flex-row items-center text-center border border-black rounded-xl py-2 px-8 mx-auto my-4 transition-shadow duration-300 shadow-flat-black-adjust hover:shadow-none focus:shadow-none"
                onClick={handleRequestRoleUpdate}>
                <span
                  className="font-roboto no-correct text-black text-sm font-medium leading-4">Devenir un Steps</span>
                <span className="w-fit mx-auto relative">
                  <FontAwesomeIcon icon={faPersonPraying} className="text-black h-6 w-6 mx-auto ml-4 relative z-[2]"/>
                </span>
              </button>
            ) : user.status === 'refused' ? (
              <p
                translate="no"
                className="font-sans w-fit relative bg-red-medium flex flex-row items-center text-center border border-black rounded-xl py-2 px-8 mx-auto my-4 transition-shadow duration-300 shadow-flat-black-adjust">
                <span className="font-roboto no-correct text-white text-xs leading-4">Demande <br/> refusée</span>
                <span className="w-fit mx-auto relative">
                  <FontAwesomeIcon icon={faTriangleExclamation}
                                   className="text-white h-6 w-6 mx-auto ml-4 relative z-[2]"/>
                </span>
              </p>
            ) : user.status === 'pending' ? (
              <p
                translate="no"
                className="font-sans w-fit relative bg-yellow-light flex flex-row items-center text-center border border-black rounded-xl py-2 px-8 mx-auto my-4 transition-shadow duration-300 shadow-flat-black-adjust">
                <span className="font-roboto no-correct text-black text-xs leading-4">Demande <br/> en attente</span>
                <span className="w-fit mx-auto my-auto relative">
                  <FontAwesomeIcon icon={faHourglassHalf} className="text-black h-4 w-4 mx-auto ml-4 relative z-[2]"/>
                </span>
              </p>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
