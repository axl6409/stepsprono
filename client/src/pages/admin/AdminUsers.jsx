import React, {useContext, useEffect, useState} from 'react';
import axios from 'axios';
import moment from 'moment';
import {useCookies} from "react-cookie";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {Link} from "react-router-dom";
import ConfirmationModal from "../../components/modals/ConfirmationModal.jsx";
import {AppContext} from "../../contexts/AppContext.jsx";
import Loader from "../../components/partials/Loader.jsx";
import SimpleTitle from "../../components/partials/SimpleTitle.jsx";
import BackButton from "../../components/nav/BackButton.jsx";
import {faCircleXmark, faPen} from "@fortawesome/free-solid-svg-icons";
import JoystickButton from "../../components/buttons/JoystickButton.jsx";
import AlertModal from "../../components/modals/AlertModal.jsx";
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const { userRequests } = useContext(AppContext)
  const [cookies] = useCookies(['token']);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState(null);
  const [modalAnimation, setModalAnimation] = useState('');
  const token = localStorage.getItem('token') || cookies.token
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTriggered, setIsTriggered] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState(null);

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get(`${apiUrl}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })
      setUsers(response.data)
      setIsLoading(false)
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs :', error)
    }
  };

  useEffect(() => {
    fetchUsers()
  }, []);

  useEffect(() => {
    if (userRequests && userRequests.length > 0) {
      setRequests(userRequests);
    }
  }, [userRequests])

  const toggleStatusRuled = async (userList) => {
    const userIds = userList.map(u => u.id);

    try {
      const response = await axios.put(`${apiUrl}/api/admin/users/status/ruled`,
        { userIds },
        { headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status === 200) {
        setAlertMessage("Status des utilisateurs passé à 'ruled'.");
        setAlertType('success');
        await fetchUsers();
      }

    } catch (error) {
      console.error("Erreur lors du changement du statut :", error);
      setAlertMessage("Impossible de mettre à jour le status des utilisateurs");
      setAlertType('error');
      setTimeout(() => setAlertMessage(''), 2000);
    }
  }

  const handleDeleteUser = (userId) => {
    setShowConfirmationModal(true)
    setUserIdToDelete(userId)
    setModalAnimation('modal-enter')
  };

  const deleteUser = async () => {
    setModalAnimation('modal-exit');
    setTimeout(async () => {
      try {
        await axios.delete(`${apiUrl}/api/admin/user/delete/${userIdToDelete}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setShowConfirmationModal(false)
        setModalAnimation('')
        await fetchUsers()
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'utilisateur :', error);
      }
    }, 500);
  };

  const handleCloseModal = () => {
    setModalAnimation('modal-exit');
    setTimeout(() => setShowConfirmationModal(false), 500);
  };

  const getRequestForUser = (userId) => {
    return requests.find(request => request.id === userId);
  };

  const formatDate = (dateString) => {
    return moment(dateString).format('DD/MM/YYYY - HH:mm:ss');
  };

  const approvedUsers = users
    .filter(u => u.status === 'approved' || u.status === 'ruled')
    .sort((a, b) => new Date(b.last_connect) - new Date(a.last_connect));

  const blockedUsers  = users
    .filter(u => u.status === 'blocked')
    .sort((a, b) => new Date(b.last_connect) - new Date(a.last_connect));

  const retiredUsers  = users
    .filter(u => u.status === 'retired')
    .sort((a, b) => new Date(b.last_connect) - new Date(a.last_connect));

  const renderUserItem = (user) => {
    const request = getRequestForUser(user.id);
    return (
      <li className="relative z-[21] my-2 flex flex-row justify-between" key={user.id}>
        <div className="w-2/3">
          <p
            className="font-roboto w-[25px] h-[25px] rounded-full text-center text-xxs text-black font-medium leading-6 border border-black bg-white shadow-flat-black-adjust absolute z-[5] -left-4 -top-2">
            #{user.id}
          </p>
          <p
            className="username w-fit relative font-roboto font-medium text-base leading-5 my-auto border border-black bg-white py-1 px-4 h-fit shadow-flat-black-adjust">
            {user.username}
            {user.status === 'blocked' && (
              <span
                className="absolute z-[3] -right-1.5 -top-2.5 font-rubik text-xxs text-center leading-4 translate-x-1 translate-y-1 w-4 h-4 border border-black rounded-full bg-red-medium shadow-flat-black-adjust-50">&#10006;</span>
            )}
            {user.status === 'ruled' && (
              <span
                className="absolute z-[3] -right-1.5 -top-2.5 translate-x-1 translate-y-1 w-4 h-4 border border-black rounded-full bg-blue-medium shadow-flat-black-adjust-50"></span>
            )}
          </p>
          <p
            className="font-rubik w-44 relative mt-4 text-center text-balance text-xxs px-2 pb-0 pt-1 text-black font-medium leading-4 border border-black bg-white">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 w-40 h-3 bg-white px-2 border-t border-r border-l border-black rounded-t-xl">Dernière connexion</span>
            <span>{formatDate(user.last_connect)}</span>
          </p>
        </div>

        <div className="w-1/3 flex flex-row justify-end">
          <Link
            to={`/admin/users/edit/${user.id}`}
            className="relative m-2 block h-8 w-8 before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-green-lime before:border-black before:border group"
          >
            <span
              className="relative z-[2] w-full flex flex-row justify-center border border-black text-black px-2 py-1.5 rounded-full text-center font-sans uppercase font-bold shadow-md bg-white transition -translate-y-0.5 -translate-x-0.5 group-hover:-translate-y-0 group-hover:-translate-x-0">
              <FontAwesomeIcon icon={faPen}/>
            </span>
          </Link>

          <button
            onClick={() => handleDeleteUser(user.id)}
            className="relative m-2 block h-8 w-8 before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-green-lime before:border-black before:border group"
          >
            <span
              className="relative z-[2] w-full flex flex-row justify-center border border-black text-black px-2 py-1.5 rounded-full text-center font-sans uppercase font-bold shadow-md bg-white transition -translate-y-0.5 -translate-x-0.5 group-hover:-translate-y-0 group-hover:-translate-x-0">
              <FontAwesomeIcon icon={faCircleXmark}/>
            </span>
          </button>
        </div>
      </li>
    );
  };

  const renderSection = (title, list) => {
    if (!list || list.length === 0) return null;
    return (
      <div className="relative z-[11] py-3.5 mb-10 pr-0 bg-yellow-medium mx-auto  w-11/12 border border-black rounded-xl shadow-flat-black">
        <h3 className="font-roboto uppercase w-fit block font-medium text-base mb-3 mx-auto border border-black bg-white px-4 py-1 shadow-flat-black-adjust">
          {title}
        </h3>
        <div className="relative z-[2] h-fit w-fit mx-auto mt-8 mb-4 flex flex-row justify-center items-center">
          <p className="text-center font-roboto uppercase w-32 -mt-2 font-black leading-4">Trigger Rule Message</p>
          <JoystickButton checked={isTriggered} mode={isTriggered === true ? "checked" : "trigger"} onChange={() => toggleStatusRuled(list)} />
        </div>
        <ul className="flex pl-6 pr-3 flex-col justify-start">
          {list.map(renderUserItem)}
        </ul>
      </div>
    );
  };

  return (
    isLoading ? (
      <Loader />
    ) : (
      <div className="inline-block relative z-20 w-full h-auto pt-24 py-12">
        <AlertModal message={alertMessage} type={alertType} />
        <BackButton />
        <SimpleTitle title={"Gestion des utilisateurs"} stickyStatus={false} uppercase={true} fontSize={'2.5rem'} />

        <div className="mt-4">
          {renderSection('Utilisateurs approuvés', approvedUsers)}
          {renderSection('Utilisateurs bloqués', blockedUsers)}
          {renderSection('Utilisateurs retirés', retiredUsers)}

          {/* Si aucune liste n’a d’élément, on affiche un message */}
          {approvedUsers.length === 0 && blockedUsers.length === 0 && retiredUsers.length === 0 && (
            <div className="py-6 px-6 bg-white mx-2.5 border-2 border-black shadow-flat-black text-center font-rubik">
              Aucun utilisateur à afficher pour les statuts « approved », « bloqued » ou « retired ».
            </div>
          )}
        </div>

        {showConfirmationModal && (
          <div className={`modal ${modalAnimation} fixed z-[30] top-32 left-0 right-0`}>
            <ConfirmationModal
              message="Êtes-vous sûr de vouloir supprimer cet utilisateur ?"
              onConfirm={deleteUser}
              onCancel={handleCloseModal}
            />
          </div>
        )}
      </div>
    )
  );
}

export default AdminUsers;