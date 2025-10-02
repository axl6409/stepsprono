import React, {useState, useEffect} from 'react';
import { useCookies } from 'react-cookie';
import chasedRuleIcon from "../../assets/components/rules/jour_de_chasse.png";
import { Link } from "react-router-dom";
import SimpleTitle from "../partials/SimpleTitle.jsx";
import chasedUserImage from "../../assets/components/rules/jour-de-chasse-icon.png";
import AnimatedTitle from "../partials/AnimatedTitle.jsx";

const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const HiddenPredictions = ({ rule, user, viewedUser, isOwnProfile }) => {
  const [cookies] = useCookies(['token']);
  const token = localStorage.getItem('token') || cookies.token;
  const [displayChased, setDisplayChased] = useState(true);

  useEffect(() => {
    if (
      (user.id === rule.selectedUserDatas?.id && isOwnProfile) ||
      (viewedUser.id === rule.selectedUserDatas?.id)
    ) {
      setDisplayChased(false);
    }
  }, [token, user, viewedUser, rule, isOwnProfile]);

  return (
    <div className="block relative z-20 flex flex-col justify-center items-center mb-4">
      <div className="w-full -rotate-[5deg] relative">
        <AnimatedTitle title="Silence des pronos" darkMode={true} stickyStatus={false} />
      </div>
      <Link
        to="/hidden-predictions"
        className="w-fit absolute left-1/2 -translate-x-1/2 -top-6 fade-in block mx-auto before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-black before:border-black before:border group"
      >
        <span
          translate="no"
          className="relative z-[2] w-full block border border-black text-black uppercase font-regular text-sm font-roboto px-3 py-1 rounded-full text-center shadow-md bg-purple-light transition -translate-y-1 group-hover:-translate-y-0"
        >
          Voir la vidéo
        </span>
      </Link>
    </div>
  );
};

export default HiddenPredictions;
