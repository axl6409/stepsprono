import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import chasedRuleIcon from "../../assets/components/rules/jour_de_chasse.png";
import {Link} from "react-router-dom";
import SimpleTitle from "../partials/SimpleTitle.jsx";
import chasedUserImage from "../../assets/components/rules/jour-de-chasse-icon.png";

const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const HuntDay = ({rule, user, viewedUser, isOwnProfile}) => {
  const [cookies] = useCookies(['token']);
  const token = localStorage.getItem('token') || cookies.token;
  const [isLoading, setIsLoading] = useState(true);
  const [displayChased, setDisplayChased] = useState(true);

  useEffect(() => {
    if ((user.id === rule.selectedUserDatas?.id) && isOwnProfile || (viewedUser.id === rule.selectedUserDatas?.id)) {
      setDisplayChased(false)
    }
  }, [token]);

  return (
    <div className="block relative z-20 flex flex-col justify-center items-center mb-4">
      <div className="w-full -rotate-[5deg]">
        <img src={chasedRuleIcon} alt=""/>
      </div>
      <Link
        to="/jour-de-chasse"
        className="w-fit absolute left-1/2 -translate-x-1/2 -top-6 fade-in block mx-auto before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-black before:border-black before:border group"
      >
        <span
          translate="no"
          className="relative z-[2] w-full block border border-black text-black uppercase font-regular text-sm font-roboto px-3 py-1 rounded-full text-center shadow-md bg-yellow-light transition -translate-y-1 group-hover:-translate-y-0"
        >
          Voir la vidéo
        </span>
      </Link>
      {displayChased && rule?.selectedUserDatas && (
        <div className="fade-in absolute right-4 bottom-4 anim-rotate-attract w-20 h-24">
          <SimpleTitle stickyStatus={false} fontSize={14} title={rule.selectedUserDatas.username} darkMode={true}/>
          <div className="relative z-10 w-full h-20">
            <div className="absolute inset-0 rounded-full border-2 border-black shadow-md overflow-hidden z-10 bg-white">
              <img
                className="w-full h-full object-cover"
                src={`${apiUrl}/uploads/users/${rule.selectedUserDatas.id}/${rule.selectedUserDatas.img || 'default.png'}`}
                alt="Cible sélectionnée"
              />
            </div>
            <div className="absolute inset-0 transition-all duration-300 ease-in-out rotate-scale rounded-full overflow-hidden z-10">
              <img
                className="h-full w-full object-contain"
                src={chasedUserImage}
                alt=""
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HuntDay;
