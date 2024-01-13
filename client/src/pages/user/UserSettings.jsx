import React, { useEffect, useState, useContext } from 'react';
import {UserContext} from "../../contexts/UserContext.jsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import axios from "axios";
import {
  faPen,
  faBellConcierge,
  faHourglassHalf,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import {Link} from "react-router-dom";
import StatusModal from "../../components/partials/modals/StatusModal.jsx"
import BackButton from "../../components/nav/BackButton.jsx"
import {useCookies} from "react-cookie";
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const UserSettings = () => {
  const [cookies, setCookie] = useCookies(["user"]);
  const token = localStorage.getItem('token') || cookies.token
  const { user, updateUserStatus } = useContext(UserContext);
  const isVisitor = user.role === 'visitor';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updateStatus, setUpdateStatus] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');

  useEffect(() => {
    console.log(user.status)
  }, [user])

  const handleRequestRoleUpdate = async () => {
    try {
      const response = await axios.patch(`${apiUrl}/api/user/${user.id}/request-role`, null,{
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (response.status === 200) {
        setUpdateStatus(true);
        setUpdateMessage('Utilisateur modifié avec succès');
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

  return (
    <div className="text-center relative pb-10 flex flex-col justify-center">
      <BackButton />
      {isModalOpen && (
        <StatusModal message={updateMessage} status={updateStatus} closeModal={closeModal}/>
      )}
      <div className="relative">
        <h1 className="text-3xl font-black my-8 mt-0 uppercase relative w-fit mx-auto">{user.username}
          <span className="absolute left-0 bottom-0 text-flat-purple z-[-1] transition-all duration-700 ease-in-out delay-500 -translate-x-0.5 translate-y-0.5">{user.username}</span>
          <span className="absolute left-0 bottom-0 text-green-lime z-[-2] transition-all duration-700 ease-in-out delay-700 -translate-x-1 translate-y-1">{user.username}</span>
        </h1>
        <Link to={`/admin/users/edit/${user.id}`}
          className="absolute right-4 -top-1 m-2 block h-fit before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-green-lime before:border-black before:border-2 group"
        >
          <span className="relative z-[2] w-full flex flex-row justify-center border-2 border-black text-black px-2 py-1.5 rounded-full text-center font-sans uppercase font-bold shadow-md bg-white transition -translate-y-1 -translate-x-0.5 group-hover:-translate-y-0 group-hover:-translate-x-0">
            <FontAwesomeIcon icon={faPen} />
          </span>
        </Link>

        <div className="bg-black py-4 px-8">
          <div className="w-full mx-auto flex flex-col">
            <p className="font-sans bg-flat-purple w-fit text-white font-medium relative z-[5] -bottom-3.5 left-2.5 py-1 px-2.5 rounded-full border border-black shadow-flat-black">Status du compte</p>
            <div className="bg-white flex flex-row justify-between pb-2.5 px-4 pt-5 rounded-xl border-2 border-black relative z-[4] shadow-flat-purple">
              <p className="font-sans text-black uppercase font-black text-center text-l h-fit my-auto">{user.role}</p>
              {isVisitor && user.status !== 'pending' && user.status !== 'refused' && user.status !== 'aproved' ? (
                <button
                  className="font-sans relative bg-flat-orange flex flex-col text-center border border-black rounded-xl pt-2 pb-1 px-2.5 transition-shadow duration-300 shadow-flat-black-adjust hover:shadow-none focus:shadow-none"
                  onClick={handleRequestRoleUpdate}
                  >
                  <span className="font-bold text-white text-xs leading-4 text-shadow-black">Devenir <br/> un Steps</span>
                  <span className="w-fit mx-auto relative">
                    <FontAwesomeIcon icon={faBellConcierge} className="text-white w-fit mx-auto mt-1 relative z-[2]"/>
                    <FontAwesomeIcon icon={faBellConcierge} className="text-black w-fit mx-auto mt-1 absolute left-0.5 top-0.5 z-[1]"/>
                  </span>
                </button>
              ) : user.status === 'refused' ? (
                <p
                  className="font-sans relative bg-deep-red flex flex-col text-center border border-black rounded-xl pt-2 pb-1 px-2.5 transition-shadow duration-300 shadow-flat-black-adjust"
                  >
                  <span className="font-bold text-white text-xs leading-4 text-shadow-black">Demande <br/> refusée</span>
                  <span className="w-fit mx-auto relative">
                    <FontAwesomeIcon icon={faTriangleExclamation} className="text-white w-fit mx-auto mt-1 relative z-[2]"/>
                    <FontAwesomeIcon icon={faTriangleExclamation} className="text-black w-fit mx-auto mt-1 absolute left-0.5 top-0.5 z-[1]"/>
                  </span>
                </p>
              ) : user.status === 'pending' ? (
                <p
                  className="font-sans relative bg-green-lime-deep flex flex-col text-center border border-black rounded-xl pt-2 pb-1 px-2.5 transition-shadow duration-300 shadow-flat-black-adjust"
                  >
                  <span className="font-bold text-white text-xs leading-4 text-shadow-black">Demande <br/> en attente</span>
                  <span className="w-fit mx-auto relative">
                    <FontAwesomeIcon icon={faHourglassHalf} className="text-white w-fit mx-auto mt-1 relative z-[2]"/>
                    <FontAwesomeIcon icon={faHourglassHalf} className="text-black w-fit mx-auto mt-1 absolute left-0.5 top-0.5 z-[1]"/>
                  </span>
                </p>
              ) : null }
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserSettings;
