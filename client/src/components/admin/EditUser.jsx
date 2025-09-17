import React, {useContext, useEffect, useState} from 'react';
import axios from 'axios';
import {useCookies} from "react-cookie";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCaretLeft, faCircleXmark, faPen} from "@fortawesome/free-solid-svg-icons";
import {Link, useParams} from "react-router-dom";
import BackButton from "../nav/BackButton.jsx";
import StatusModal from "../modals/StatusModal.jsx";
import {UserContext} from "../../contexts/UserContext.jsx";
import {AppContext} from "../../contexts/AppContext.jsx";
import SimpleTitle from "../partials/SimpleTitle.jsx";
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
    <div className="py-20 relative z-20">
      {isModalOpen && (
        <StatusModal message={updateMessage} status={updateStatus} closeModal={closeModal}/>
      )}
      <BackButton/>
      <p translate="no" className="font-rubik font-bold text-l uppercase text-center">Modification du compte</p>
      <SimpleTitle title={userEdited.username} stickyStatus={false}></SimpleTitle>
      <div className="py-3.5 px-6 bg-beige-light mx-2.5 my-8 border border-black shadow-flat-black rounded-xl">
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col my-4">
            <label translate="no" htmlFor="username" className="font-rubik font-medium text-sm">Nom d'utilisateur</label>
            <input translate="no" type="text" id="username" className="font-rubik border border-black shadow-flat-black-adjust px-4 py-1 text-sm"
                   value={userEdited.username} onChange={handleChange}/>
          </div>
          <div className="flex flex-col my-4">
            <label translate="no" htmlFor="email" className="font-rubik font-medium text-sm">Email</label>
            <input translate="no" type="email" id="email" className="font-rubik border border-black shadow-flat-black-adjust px-4 py-1 text-sm"
                   value={userEdited.email} onChange={handleChange}/>
          </div>
          <div className="flex flex-col my-4">
            <label translate="no" htmlFor="role" className="font-rubik font-medium text-sm">Rôle</label>
            <select
              translate="no"
              name="role"
              id="role"
              className="w-full py-2 px-4 font-rubik text-sm uppercase border border-black shadow-flat-black-adjust"
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
            translate="no"
            type="button"
            className="w-full relative my-4 before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:bg-light-red before:border-black before:border before:translate-x-1 group"
            onClick={() => setShowPasswordFields(!showPasswordFields)}>
            <span
              translate="no"
              className="relative z-[2] w-full block border border-black font-rubik text-black px-3 py-2 text-center shadow-md bg-white transition -translate-y-1 group-hover:-translate-y-0 group-hover:translate-x-1">Modifier le mot de passe</span>
          </button>
          {showPasswordFields && (
            <div className="flex flex-col mb-8">
              <div className="flex flex-col">
                <label translate="no" htmlFor="password" className="font-rubik font-regular text-sm">Mot de passe</label>
                <input translate="no" type="password" id="password"
                       className="border-2 border-black shadow-flat-black px-4 py-1 text-sm" onChange={handleChange}/>
              </div>
              <div className="flex flex-col mt-2">
                <label translate="no" htmlFor="confirmPassword" className="font-rubik font-regular text-sm">Confirmer le mot de
                  passe</label>
                <input translate="no" type="password" id="confirmPassword"
                       className="border-2 border-black shadow-flat-black px-4 py-1 text-sm" onChange={handleChange}/>
              </div>
            </div>
          )}
          <div className="flex flex-row flex-wrap justify-center">
            <div className="file-upload-wrapper fade-in relative inline-block mt-4 cursor-pointer group">
              <input className="absolute top-0 left-0 w-full h-full opacity-0 z-[2] cursor-pointer" onChange={handleFileChange}  type="file" accept="image/*"/>
              <label translate="no" className="custom-file-upload relative inline-block cursor-pointer font-roboto text-black underline text-base px-4 py-1 rounded text-center transition-all duration-300 ease-in-out group-hover:bg-grey-medium group-hover:text-white">
                Changer la photo
              </label>
            </div>
            {userEdited.avatarUrl &&
              <div
                className="w-[200px] h-[200px] mx-auto my-4 flex flex-col justify-center rounded-full bg-white border-black border-2 shadow-flat-black overflow-hidden">
                <img src={apiUrl + "/uploads/users/" + userEdited.id + "/" + userEdited.avatarUrl} alt="Avatar actuel" className="block my-auto mx-auto w-full h-full object-cover object-center"/>
              </div>
            }
          </div>
          <button
            translate="no"
            type="submit"
            className="w-full relative my-4 before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:bg-black before:border-black before:border-2 before:translate-x-1 group"
          >
            <span
              translate="no"
              className="relative z-[2] w-full block border-2 border-black text-black font-bold px-3 py-2 text-center shadow-md bg-white transition -translate-y-1 group-hover:-translate-y-0 group-hover:translate-x-1">Mettre à jour</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditUser;
