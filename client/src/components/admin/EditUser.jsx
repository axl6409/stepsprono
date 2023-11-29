import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {useCookies} from "react-cookie";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCaretLeft, faCircleXmark, faPen} from "@fortawesome/free-solid-svg-icons";
import {Link, useParams} from "react-router-dom";
import BackButton from "../nav/BackButton.jsx";
import StatusModal from "../partials/modals/StatusModal.jsx";
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const EditUser = () => {
  const [user, setUser] = useState({
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

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/admin/user/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const correctedAvatarUrl = response.data.img
        if (response.data.img) {
          const correctedAvatarUrl = response.data.img.replace(/\\/g, '/');
        }
        setUser({ ...response.data, avatarUrl: `${correctedAvatarUrl}`, password: '', confirmPassword: '' });
      } catch (error) {
        console.error('Erreur lors de la récupération des données de l\'utilisateur', error);
      }
    };

    fetchUser();
  }, [id, token]);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.id]: e.target.value });
  };

  const handleFileChange = (e) => {
    setUser({ ...user, avatar: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('username', user.username);
    formData.append('email', user.email);
    if (showPasswordFields) {
      formData.append('password', user.password);
      formData.append('confirmPassword', user.confirmPassword);
    }
    if (user.avatar) {
      formData.append('avatar', user.avatar);
    }

    try {
      const response = await axios.put(`${apiUrl}/api/admin/user/update/${id}`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      const result = await response.data;
      if (response.status === 200) {
        setUpdateStatus(true);
        setUpdateMessage('Utilisateur modifié avec succès');
        setIsModalOpen(true)
        setTimeout(function () {
          closeModal()
        }, 1500)
      } else {
        setUpdateStatus(false);
        setUpdateMessage('Erreur lors de la mise à jour de l\'utilisateur');
        setIsModalOpen(true)
      }
    } catch (error) {
      setUpdateStatus(false);
      setUpdateMessage('Erreur côté serveur lors de l\'envoi des informations de l\'utilisateur');
      setIsModalOpen(true)
    }
  };

  const closeModal = () => {
    setUpdateStatus(false);
    setUpdateMessage('');
    setIsModalOpen(false);
  };

  return (
    <div>
      {isModalOpen && (
        <StatusModal message={updateMessage} status={updateStatus} closeModal={closeModal}/>
      )}
      <BackButton/>
      <p className="font-sans font-bold text-md uppercase text-center">Modification du compte</p>
      <h1 className="text-3xl font-black mb-8 uppercase relative w-fit mx-auto">{user.username}
        <span className="absolute left-0 bottom-0 text-flat-purple z-[-1] transition-all duration-700 ease-in-out delay-500 -translate-x-0.5 translate-y-0.5">{user.username}</span>
        <span className="absolute left-0 bottom-0 text-green-lime z-[-2] transition-all duration-700 ease-in-out delay-700 -translate-x-1 translate-y-1">{user.username}</span>
      </h1>
      <div className="py-3.5 px-6 bg-flat-yellow mx-2.5 my-8 border-2 border-black shadow-flat-black">
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col my-4">
            <label htmlFor="username" className="font-title font-bold text-xl">Nom d'utilisateur</label>
            <input type="text" id="username" className="border-2 border-black shadow-flat-black px-4 py-1 text-sm" value={user.username} onChange={handleChange} />
          </div>
          <div className="flex flex-col my-4">
            <label htmlFor="email" className="font-title font-bold text-xl">Email</label>
            <input type="email" id="email" className="border-2 border-black shadow-flat-black px-4 py-1 text-sm" value={user.email} onChange={handleChange} />
          </div>
          <button
            type="button"
            className="w-full relative my-4 before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:bg-light-red before:border-black before:border-2 before:translate-x-1.5 group"
            onClick={() => setShowPasswordFields(!showPasswordFields)}>
            <span className="relative z-[2] w-full block border-2 border-black text-black font-bold px-3 py-2 text-center shadow-md bg-white transition -translate-y-1.5 group-hover:-translate-y-0 group-hover:translate-x-1.5">Modifier le mot de passe</span>
          </button>
          {showPasswordFields && (
            <div className="flex flex-col mb-8">
              <div className="flex flex-col">
                <label htmlFor="password" className="font-title font-bold text-xl">Mot de passe</label>
                <input type="password" id="password" className="border-2 border-black shadow-flat-black px-4 py-1 text-sm" onChange={handleChange} />
              </div>
              <div className="flex flex-col">
                <label htmlFor="confirmPassword" className="font-title font-bold text-xl">Confirmer le mot de passe</label>
                <input type="password" id="confirmPassword" className="border-2 border-black shadow-flat-black px-4 py-1 text-sm" onChange={handleChange} />
              </div>
            </div>
          )}
          <div className="flex flex-row flex-wrap">
            <label htmlFor="avatar" className="w-full font-title font-bold text-xl">Image de profil</label>
            <input type="file" id="avatar"
               className="block w-full font-sans text-sm text-black cursor-pointer file:me-4 file:py-2 file:px-4 file:cursor-pointer file:border-2 file:border-solid file:border-black file:text-sm file:font-bold file:bg-black file:text-white hover:file:bg-white hover:file:text-black file:disabled:opacity-50 file:disabled:pointer-events-none"
               onChange={handleFileChange} />
            {user.avatarUrl && <div className="w-[200px] h-[200px] mx-auto my-4 flex flex-col justify-center rounded-full bg-white border-black border-2 shadow-flat-black"><img src={user.avatarUrl} alt="Avatar actuel" className="block my-auto mx-auto" /></div>}
          </div>
          <button
            type="submit"
            className="w-full relative my-4 before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:bg-green-lime before:border-black before:border-2 before:translate-x-1.5 group"
          >
            <span className="relative z-[2] w-full block border-2 border-black text-black font-bold px-3 py-2 text-center shadow-md bg-white transition -translate-y-1.5 group-hover:-translate-y-0 group-hover:translate-x-1.5">Mettre à jour</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditUser;
