import React, {useContext, useEffect, useState} from 'react';
import axios from 'axios';
import moment from 'moment';
import {useCookies} from "react-cookie";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {Link} from "react-router-dom";
import ConfirmationModal from "../../components/partials/modals/ConfirmationModal.jsx";
import {AppContext} from "../../contexts/AppContext.jsx";
import Loader from "../../components/partials/Loader.jsx";
import SimpleTitle from "../../components/partials/SimpleTitle.jsx";
import BackButton from "../../components/nav/BackButton.jsx";
import {faCircleXmark, faPen} from "@fortawesome/free-solid-svg-icons";
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

  return (
    isLoading ? (
      <Loader />
    ) : (
      <div className="inline-block w-full h-auto py-12">
        <BackButton />
        <SimpleTitle title={"Gestion des utilisateurs"} stickyStatus={false} uppercase={true} fontSize={'2.5rem'} />
        <div className="py-3.5 mb-20 px-6 pr-0 bg-flat-yellow mx-2.5 border-2 border-black shadow-flat-black">
          <ul className="flex flex-col justify-start">
            {users.map(user => {
                const request = getRequestForUser(user.id)
                return (
                  <li className="relative my-2 flex flex-row justify-between" key={user.id}>
                    <div>
                      <p
                        className="font-rubik w-[25px] h-[25px] rounded-full text-center text-xs text-black font-medium leading-6 border border-black bg-white shadow-flat-black-adjust absolute z-[5] -left-4 -top-2">{user.id}</p>
                      <p
                        className="username w-fit relative font-title font-bold text-xl leading-6 my-auto border-2 border-black bg-white py-1 px-4 h-fit shadow-flat-black">
                        {user.username}
                        {request && (
                          <span
                            className="absolute z-[3] -right-1.5 -top-2.5 translate-x-1 translate-y-1 w-4 h-4 border-2 border-black rounded-full bg-flat-red transition duration-300 group-hover:translate-y-2.5"></span>
                        )}
                      </p>
                      <p
                        className="font-rubik mt-2 px-4 text-center text-balance text-xxs px-2 text-black font-medium leading-4 border border-black bg-white shadow-flat-black-adjust">
                        Dernière connexion : <br /> {formatDate(user.last_connect)}
                      </p>
                    </div>
                    <div className="flex flex-row">
                      <Link to={`/admin/users/edit/${user.id}`}
                            className="relative m-2 block h-fit before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-green-lime before:border-black before:border-2 group"
                      >
                        <span
                          className="relative z-[2] w-full flex flex-row justify-center border-2 border-black text-black px-2 py-1.5 rounded-full text-center font-sans uppercase font-bold shadow-md bg-white transition -translate-y-1 -translate-x-0.5 group-hover:-translate-y-0 group-hover:-translate-x-0">
                          <FontAwesomeIcon icon={faPen}/>
                        </span>
                      </Link>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="relative m-2 block h-fit before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-green-lime before:border-black before:border-2 group"
                      >
                        <span
                          className="relative z-[2] w-full flex flex-row justify-center border-2 border-black text-black px-2 py-1.5 rounded-full text-center font-sans uppercase font-bold shadow-md bg-white transition -translate-y-1 -translate-x-0.5 group-hover:-translate-y-0 group-hover:-translate-x-0">
                          <FontAwesomeIcon icon={faCircleXmark}/>
                        </span>
                      </button>
                    </div>
                  </li>
                )
              }
            )}
          </ul>
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
      </div>
    )
  );
}

export default AdminUsers;