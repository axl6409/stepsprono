import React, {useState, useEffect} from 'react';
import { useCookies } from 'react-cookie';
import chasedRuleIcon from "../../assets/components/rules/jour_de_chasse.png";
import { Link } from "react-router-dom";
import SimpleTitle from "../partials/SimpleTitle.jsx";
import chasedUserImage from "../../assets/components/rules/jour-de-chasse-icon.png";
import AnimatedTitle from "../partials/AnimatedTitle.jsx";

const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const AllianceDay = ({ rule, user, viewedUser, isOwnProfile }) => {
  const [cookies] = useCookies(['token']);

  const referenceUserId = isOwnProfile ? user.id : viewedUser?.id;

  const myGroup = rule.config?.selected_users?.find(group =>
    group.some(u => u.id === referenceUserId)
  );
  const partner = myGroup ? myGroup.find(u => u.id !== referenceUserId) : null;

  return (
    <div className="relative z-20 flex flex-col justify-center items-center mb-4 mt-8">
      <div className="w-full rotate-[5deg] relative">
        <AnimatedTitle title="Bande Organisée" darkMode={true} stickyStatus={false} />
      </div>
      <Link
        to="/alliance-day"
        className="w-fit absolute left-1/2 -translate-x-1/2 -top-6 fade-in block mx-auto before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-black before:border-black before:border group"
      >
        <span
          translate="no"
          className="relative z-[2] w-full block border border-black text-black uppercase font-regular text-sm font-roboto px-3 py-1 rounded-full text-center shadow-md bg-purple-light transition -translate-y-1 group-hover:-translate-y-0"
        >
          Voir la vidéo
        </span>
      </Link>
      {partner && (
        <div className="fade-in absolute right-4 -top-10 w-20 h-24">
          <SimpleTitle
            stickyStatus={false}
            fontSize={16}
            title={partner.username}
            darkMode={false}
          />
          <div className="relative z-10 w-full h-20">
            <div className="absolute inset-0 rounded-full border-2 border-black shadow-md overflow-hidden z-10 bg-white">
              <img
                className="w-full h-full object-cover"
                src={`${apiUrl}/uploads/users/${partner.id}/${partner.img || 'default.png'}`}
                alt={partner.username}
              />
            </div>
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 z-10">
              <p className="text-xl4">🤝</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllianceDay;
