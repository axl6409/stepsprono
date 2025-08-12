import React, {useContext, useEffect, useState} from 'react';
import axios from 'axios';
import {useCookies} from "react-cookie";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCaretLeft, faCircleXmark, faPen} from "@fortawesome/free-solid-svg-icons";
import {Link, useParams} from "react-router-dom";
import BackButton from "../nav/BackButton.jsx";
import StatusModal from "../partials/modals/StatusModal.jsx";
import {UserContext} from "../../contexts/UserContext.jsx";
import {AppContext} from "../../contexts/AppContext.jsx";
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const EditUser = () => {
  const { user } = useContext(UserContext)
  const [userEdited, setUserEdited] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    avatar: null,
    avatarUrl: '',
  });
  const [cookies] = useCookies(['token']);
  const { id } = useParams()
  const token = localStorage.getItem('token') || cookies.token
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updateStatus, setUpdateStatus] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(userEdited.role);
  const { refreshUserRequests } = useContext(AppContext);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/user/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const userData = response.data;
        const correctedAvatarUrl = userData.img ? userData.img.replace(/\\/g, '/') : '';
        setUserEdited({ ...userData, avatarUrl: correctedAvatarUrl, password: '', confirmPassword: '' });
        setSelectedRole(userData.Roles[0].name);
      } catch (error) {
        console.error('Erreur lors de la récupération des données de l\'utilisateur', error);
      }
    };
    fetchUser();
    const fetchRoles = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/admin/roles`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setRoles(response.data);
      } catch (error) {
        console.error('Erreur lors de la sélection des roles', error);
      }
    }
    fetchRoles()
  }, [id, token]);

  const handleChange = (e) => {
    if (e.target.id === 'role') {
      setSelectedRole(e.target.value);
    } else {
      setUserEdited({ ...userEdited, [e.target.id]: e.target.value });
    }
  };

  const handleFileChange = (e) => {
    setUserEdited({ ...userEdited, avatar: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (showPasswordFields) {
      if (userEdited.password !== userEdited.confirmPassword) {
        setUpdateStatus(false);
        setUpdateMessage('Les mots de passe ne correspondent pas');
        setIsModalOpen(true);
        return;
      }

      const response = await axios.post(`${apiUrl}/api/user/check-password`, {
        userId: id,
        newPassword: userEdited.password
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.samePassword) {
        setUpdateStatus(false);
        setUpdateMessage('Le nouveau mot de passe ne peut pas être le même que l\'ancien');
        setIsModalOpen(true);
        return;
      }
    }

    const formData = new FormData();
    formData.append('username', userEdited.username);
    formData.append('email', userEdited.email);
    formData.append('roleName', selectedRole);

    if (showPasswordFields) {
      formData.append('password', userEdited.password);
      formData.append('confirmPassword', userEdited.confirmPassword);
    }

    if (userEdited.avatar) {
      formData.append('type', 'profile');
      formData.append('avatar', userEdited.avatar);
    }

    try {
      const response = await axios.put(`${apiUrl}/api/user/update/${id}`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status === 200) {
        setUpdateStatus(true);
        setUpdateMessage('Utilisateur modifié avec succès');
        setIsModalOpen(true);
        refreshUserRequests();
        setTimeout(function () {
          closeModal();
          history.back();
        }, 1500);
      } else {
        setUpdateStatus(false);
        setUpdateMessage('Erreur lors de la mise à jour de l\'utilisateur');
        setIsModalOpen(true);
      }
    } catch (error) {
      setUpdateStatus(false);
      setUpdateMessage('Erreur côté serveur lors de l\'envoi des informations de l\'utilisateur');
      setIsModalOpen(true);
    }
  };


  const closeModal = () => {
    setUpdateStatus(false);
    setUpdateMessage('');
    setIsModalOpen(false);
  };

  return (
    <div className="py-20 relative z-[11]">
      {isModalOpen && (
        <StatusModal message={updateMessage} status={updateStatus} closeModal={closeModal}/>
      )}
      <BackButton/>
      <p className="font-sans font-bold text-md uppercase text-center">Modification du compte</p>
      <h1
        className={`font-black mb-12 text-center relative w-fit mx-auto text-xl4 leading-[50px]`}>{userEdited.username}
        <span
          className="absolute left-0 top-0 right-0 text-purple-soft z-[-1] translate-x-0.5 translate-y-0.5">{userEdited.username}</span>
        <span
          className="absolute left-0 top-0 right-0 text-green-soft z-[-2] translate-x-1 translate-y-1">{userEdited.username}</span>
      </h1>
      <div className="py-3.5 px-6 bg-green-light mx-2.5 my-8 border-2 border-black shadow-flat-black">
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col my-4">
            <label htmlFor="username" className="font-title font-bold text-xl">Nom d'utilisateur</label>
            <input type="text" id="username" className="border-2 border-black shadow-flat-black px-4 py-1 text-sm"
                   value={userEdited.username} onChange={handleChange}/>
          </div>
          <div className="flex flex-col my-4">
            <label htmlFor="email" className="font-title font-bold text-xl">Email</label>
            <input type="email" id="email" className="border-2 border-black shadow-flat-black px-4 py-1 text-sm"
                   value={userEdited.email} onChange={handleChange}/>
          </div>
          <div className="flex flex-col my-4">
            <label htmlFor="role">Rôle</label>
            <select
              name="role"
              id="role"
              className="w-full py-2 px-4 font-sans text-sm uppercase border-2 border-black shadow-flat-black"
              onChange={handleChange}
              value={selectedRole}
            >
              {roles.map((role) => {
                if (userEdited.role === role.name) {
                  return <option key={role.id} value={role.name}>{role.name}</option>
                } else if (role.name !== 'admin') {
                  return <option key={role.id} value={role.name}>{role.name}</option>
                }
              })}
            </select>
          </div>
          <button
            type="button"
            className="w-full relative my-4 before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:bg-light-red before:border-black before:border-2 before:translate-x-1.5 group"
            onClick={() => setShowPasswordFields(!showPasswordFields)}>
            <span
              className="relative z-[2] w-full block border-2 border-black text-black font-bold px-3 py-2 text-center shadow-md bg-white transition -translate-y-1.5 group-hover:-translate-y-0 group-hover:translate-x-1.5">Modifier le mot de passe</span>
          </button>
          {showPasswordFields && (
            <div className="flex flex-col mb-8">
              <div className="flex flex-col">
                <label htmlFor="password" className="font-title font-bold text-xl">Mot de passe</label>
                <input type="password" id="password"
                       className="border-2 border-black shadow-flat-black px-4 py-1 text-sm" onChange={handleChange}/>
              </div>
              <div className="flex flex-col">
                <label htmlFor="confirmPassword" className="font-title font-bold text-xl">Confirmer le mot de
                  passe</label>
                <input type="password" id="confirmPassword"
                       className="border-2 border-black shadow-flat-black px-4 py-1 text-sm" onChange={handleChange}/>
              </div>
            </div>
          )}
          <div className="flex flex-row flex-wrap">
            <label htmlFor="avatar" className="w-full font-title font-bold text-xl">Image de profil</label>
            <input type="file" id="avatar"
                   className="block w-full font-sans text-sm text-black cursor-pointer file:me-4 file:py-2 file:px-4 file:cursor-pointer file:border-2 file:border-solid file:border-black file:text-sm file:font-bold file:bg-black file:text-white hover:file:bg-white hover:file:text-black file:disabled:opacity-50 file:disabled:pointer-events-none"
                   onChange={handleFileChange}/>
            {userEdited.avatarUrl &&
              <div
                className="w-[200px] h-[200px] mx-auto my-4 flex flex-col justify-center rounded-full bg-white border-black border-2 shadow-flat-black overflow-hidden">
                <img src={apiUrl + "/uploads/users/" + userEdited.id + "/" + userEdited.avatarUrl} alt="Avatar actuel" className="block my-auto mx-auto w-full h-full object-cover object-center"/>
              </div>
            }
          </div>
          <button
            type="submit"
            className="w-full relative my-4 before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:bg-black before:border-black before:border-2 before:translate-x-1 group"
          >
            <span
              className="relative z-[2] w-full block border-2 border-black text-black font-bold px-3 py-2 text-center shadow-md bg-white transition -translate-y-1 group-hover:-translate-y-0 group-hover:translate-x-1">Mettre à jour</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditUser;
