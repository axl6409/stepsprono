import React, { useState, useContext } from 'react';
import {UserContext} from "../../contexts/UserContext.jsx";
import EditUser from "../../components/admin/EditUser.jsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPen} from "@fortawesome/free-solid-svg-icons";
import {Link} from "react-router-dom";

const UserSettings = () => {
  const { user } = useContext(UserContext);

  const [accountInfo, setAccountInfo] = useState({
    username: user.username,
    email: user.email,
  });

  const [settings, setSettings] = useState({
  });


  return (
    <div className="text-center relative p-10 flex flex-col justify-center">
      <div className="relative">
        <h1 className="text-3xl font-black my-8 mt-0 uppercase relative w-fit mx-auto">Compte
          <span className="absolute left-0 bottom-0 text-flat-purple z-[-1] transition-all duration-700 ease-in-out delay-500 -translate-x-0.5 translate-y-0.5">Compte</span>
          <span className="absolute left-0 bottom-0 text-green-lime z-[-2] transition-all duration-700 ease-in-out delay-700 -translate-x-1 translate-y-1">Compte</span>
        </h1>

        <Link to={`/admin/users/edit/${user.id}`}
          className="absolute -right-4 -top-1 m-2 block h-fit before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-green-lime before:border-black before:border-2 group"
        >
          <span className="relative z-[2] w-full flex flex-row justify-center border-2 border-black text-black px-2 py-1.5 rounded-full text-center font-sans uppercase font-bold shadow-md bg-white transition -translate-y-1 -translate-x-0.5 group-hover:-translate-y-0 group-hover:-translate-x-0">
            <FontAwesomeIcon icon={faPen} />
          </span>
        </Link>


      </div>
    </div>
  );
};

export default UserSettings;
