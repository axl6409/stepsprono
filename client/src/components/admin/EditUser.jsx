import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {useCookies} from "react-cookie";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircleXmark, faPen} from "@fortawesome/free-solid-svg-icons";
import {useParams} from "react-router-dom";

const EditUser = () => {
  const [user, setUser] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    avatar: null
  });
  const [cookies] = useCookies(['token']);
  const { id } = useParams()
  const token = localStorage.getItem('token') || cookies.token
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:3001/api/admin/user/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setUser({ ...response.data, password: '', confirmPassword: '' });
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
      const response = await axios.put(`http://127.0.0.1:3001/api/admin/user/update/${id}`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log(response)
      const result = await response.data;
      if (response.status === 200) {
        console.log("Utilisateur modifié avec succès :", result);
      } else {
        console.error("Erreur lors de la mise à jour de l'utilisateur :", result.error);
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi des informations de l\'utilisateur', error);
    }
  };

  return (
    <div className="py-3.5 px-6 bg-flat-yellow mx-2.5 border-2 border-black shadow-flat-black">
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Nom d'utilisateur</label>
          <input type="text" id="username" value={user.username} onChange={handleChange} />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input type="email" id="email" value={user.email} onChange={handleChange} />
        </div>
        <button type="button" onClick={() => setShowPasswordFields(!showPasswordFields)}>
          Modifier le mot de passe
        </button>
        {showPasswordFields && (
          <div>
            <div>
              <label htmlFor="password">Mot de passe</label>
              <input type="password" id="password" onChange={handleChange} />
            </div>
            <div>
              <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
              <input type="password" id="confirmPassword" onChange={handleChange} />
            </div>
          </div>
        )}
        <div>
          <label htmlFor="avatar">Image d'avatar</label>
          <input type="file" id="avatar" onChange={handleFileChange} />
        </div>
        <button type="submit">Mettre à jour</button>
      </form>

    </div>
  );
}

export default EditUser;
