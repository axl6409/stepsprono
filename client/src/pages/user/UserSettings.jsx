import React, { useEffect, useState, useContext } from 'react';
import {UserContext} from "../../contexts/UserContext.jsx";
import axios from "axios";
import {Link} from "react-router-dom";
import defaultUserImage from "../../assets/components/user/default-user-profile.png";
import iconUser from "../../assets/components/user/icon-user-purple-border.png";
import iconUserBg from "../../assets/components/user/icon-user-purple-opacity.png";
import iconMail from "../../assets/components/user/icon-mail-green-border.png";
import iconMailBg from "../../assets/components/user/icon-mail-green-opacity.png";
import iconMdp from "../../assets/components/user/icon-mdp-yellow-border.png";
import iconMdpBg from "../../assets/components/user/icon-mdp-yellow-opacity.png";
import iconHeart from "../../assets/components/user/icon-heart-red-border.png";
import iconHeartBg from "../../assets/components/user/icon-heart-red-opacity.png";
import iconTrophees from "../../assets/components/user/icon-trophees-color-border.png";
import iconTropheesBg from "../../assets/components/user/icon-trophees-star-opacity.png";
import arrowIcon from "../../assets/icons/arrow-left.svg";
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const UserSettings = (props) => {
  const { user: contextUser, setUser: setContextUser } = useContext(UserContext);
  const user = props.user || contextUser;
  const token = props.token || localStorage.getItem('token');
  const setUser = props.setUser || setContextUser;
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(user?.img || null);

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log("Selected file type: profile"); // Ajoutez cette ligne pour vérifier
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
      setSelectedImage(file);

      const formData = new FormData();
      formData.append('type', 'profile');
      formData.append('avatar', file);
      try {
        const response = await axios.put(`${apiUrl}/api/user/update/${user.id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        });
        setUser(response.data);
      } catch (error) {
        console.error('Erreur lors du téléchargement de l\'image de profil', error);
      }
    }
  };

  return (
    <div className="inline-block w-full h-auto pt-20">
      <Link
        to="/dashboard"
        className="swiper-button-prev w-[40px] h-[40px] rounded-full bg-white top-7 left-2 shadow-flat-black-adjust border-2 border-black transition-all duration-300 hover:shadow-none focus:shadow-none"
      >
        <img src={arrowIcon} alt="Icône flèche" />
      </Link>
      <div className="relative">
        <h1 className={`font-black mb-8 text-center relative w-fit mx-auto text-xl5 leading-[50px]`}>{user.username}
          <span className="absolute left-0 top-0 right-0 text-purple-soft z-[-1] translate-x-0.5 translate-y-0.5">{user.username}</span>
          <span className="absolute left-0 top-0 right-0 text-green-soft z-[-2] translate-x-1 translate-y-1">{user.username}</span>
        </h1>
        <div>
          <div className="profile-picture mt-4 w-fit mx-auto">
            <img
              src={user.img ? (apiUrl + "/uploads/users/" + user.id + "/" + user.img) : defaultUserImage}
              alt="Profil"
              className="w-40 h-40 mx-auto border-2 border-black rounded-full object-cover"/>            <div className="file-upload-wrapper relative inline-block mt-4 cursor-pointer group">
              <input className="absolute top-0 left-0 w-full h-full opacity-0 z-[2] cursor-pointer" onChange={handleImageChange}  type="file" accept="image/*"/>
              <label className="custom-file-upload relative inline-block cursor-pointer font-roboto text-grey-medium underline text-base px-4 py-1 rounded text-center transition-all duration-300 ease-in-out group-hover:bg-grey-medium group-hover:text-white">
                Changer la photo
              </label>
            </div>
          </div>
        </div>
        <div className="links mt-4 pb-20">
          <ul className="px-8">
            <li className="my-3">
              <Link
                className="block relative overflow-hidden bg-white w-full h-auto py-4 border border-black rounded-xl px-4 shadow-flat-black transition-shadow duration-300 ease-out hover:shadow-none"
                to="/settings/username">
                <span className="relative z-[5] font-roboto text-sm font-medium">Changer le pseudo</span>
                <img className="absolute z-[3] right-0 top-0" src={iconUser} alt=""/>
                <img className="absolute z-[2] right-1 -top-8" src={iconUserBg} alt=""/>
              </Link>
            </li>
            <li className="my-3">
              <Link
                className="block relative overflow-hidden bg-white w-full h-auto py-4 border border-black rounded-xl px-4 shadow-flat-black transition-shadow duration-300 ease-out hover:shadow-none"
                to="/settings/email">
                <span className="relative z-[5] font-roboto text-sm font-medium">Changer le mail</span>
                <img className="absolute z-[3] right-0 top-0" src={iconMail} alt=""/>
                <img className="absolute z-[2] right-1 -top-8" src={iconMailBg} alt=""/>
              </Link>
            </li>
            <li className="my-3">
              <Link
                className="block relative overflow-hidden bg-white w-full h-auto py-4 border border-black rounded-xl px-4 shadow-flat-black transition-shadow duration-300 ease-out hover:shadow-none"
                to="/settings/password">
                <span className="relative z-[5] font-roboto text-sm font-medium">Changer le mot de passe</span>
                <img className="absolute z-[3] right-0 top-0" src={iconMdp} alt=""/>
                <img className="absolute z-[2] right-1 -top-8" src={iconMdpBg} alt=""/>
              </Link>
            </li>
            <li className="my-3">
              <Link
                className="block relative overflow-hidden bg-white w-full h-auto py-4 border border-black rounded-xl px-4 shadow-flat-black transition-shadow duration-300 ease-out hover:shadow-none"
                to="/settings/team">
                <span className="relative z-[5] font-roboto text-sm font-medium">Trahir l'équipe de cœur</span>
                <img className="absolute z-[3] right-0 top-0" src={iconHeart} alt=""/>
                <img className="absolute z-[2] right-1 -top-1" src={iconHeartBg} alt=""/>
              </Link>
            </li>
            <li className="my-3">
              <Link
                className="block relative overflow-hidden bg-white w-full h-auto py-4 border border-black rounded-xl px-4 shadow-flat-black transition-shadow duration-300 ease-out hover:shadow-none"
                to={`/rewards/${user.id}`}>
                <span className="relative z-[5] font-roboto text-sm font-medium">Mes trophées</span>
                <img className="absolute z-[3] right-0 top-0" src={iconTrophees} alt=""/>
                <img className="absolute z-[2] right-1 -top-4" src={iconTropheesBg} alt=""/>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;
