import React, {useContext, useEffect, useState} from 'react';
import {UserContext} from "../../contexts/UserContext.jsx";
import {Link, Navigate, useNavigate} from "react-router-dom";
import BackButton from "../../components/nav/BackButton.jsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAdjust, faCaretLeft} from "@fortawesome/free-solid-svg-icons";
import {useCookies} from "react-cookie";
import {AppContext} from "../../contexts/AppContext.jsx";

const Admin = () => {
  const { user } = useContext(UserContext)
  const { userRequests } = useContext(AppContext)
  const [cookies] = useCookies(['token']);
  const navigate = useNavigate();
  const { isDebuggerActive, toggleDebugger } = useContext(AppContext);

  if (!user || user.role !== 'admin') {
    return <Navigate to={'/'} replace />
  }

  useEffect(() => {
  },[userRequests])

  return (
    <div className="inline-block w-full h-auto">
      <Link
        to="/dashboard"
        className="w-fit block relative my-4 ml-4 before:content-[''] before:inline-block before:absolute before:z-[-1] before:inset-0 before:bg-green-lime before:border-black before:border-2 group"
      >
        <span className="relative z-[2] w-full block border-2 border-black text-black px-3 py-1 text-center shadow-md bg-white transition -translate-y-1 translate-x-1 group-hover:-translate-y-0 group-hover:-translate-x-0">
          <FontAwesomeIcon icon={faCaretLeft} />
        </span>
      </Link>
      <h1 className="text-3xl font-black mt-8 mb-4 uppercase relative w-fit mx-auto">Administration
        <span className="absolute left-0 bottom-0 text-flat-purple z-[-1] transition-all duration-700 ease-in-out delay-500 -translate-x-0.5 translate-y-0.5">Administration</span>
        <span className="absolute left-0 bottom-0 text-green-lime z-[-2] transition-all duration-700 ease-in-out delay-700 -translate-x-1 translate-y-1">Administration</span>
      </h1>
      <div className="py-4 block">
        <div className="w-[90%] h-full flex flex-row justify-between items-center bg-flat-blue border-2 border-black mx-auto shadow-flat-black-adjust py-2 px-8">
          <p className="font-sans text-sm font-medium text-white">Fenêtre de debug</p>
          <div className="flex justify-center items-center">
            <button
              className={`w-14 h-7 flex items-center rounded-full border-2 border-black mx-3 px-1 shadow-flat-black-adjust focus:outline-none ${isDebuggerActive ? 'bg-green-lime-deep' : 'bg-gray-400'}`}
              onClick={toggleDebugger}
            >
              <div className={`bg-white w-5 h-5 rounded-full border-2 border-black shadow-md transform ${isDebuggerActive ? 'translate-x-6' : ''}`}></div>
            </button>
          </div>
        </div>
      </div>
      <div className="py-4 block">
        <Link
          to="/admin/users"
          className="w-3/4 block mx-auto relative my-4 before:content-[''] before:inline-block before:absolute before:z-[-1] before:inset-0 before:rounded-full before:bg-green-lime before:border-black before:border-2 group"
        >
          <span className="relative z-[2] w-full block border-2 border-black text-black px-3 py-2 rounded-full text-center shadow-md bg-white transition duration-300 -translate-y-2.5 group-hover:-translate-y-0">Utilisateurs</span>
          {userRequests && userRequests.length > 0 && (
            <div className="absolute z-[3] right-0 -top-2 translate-x-1 translate-y-1 w-4 h-4 border-2 border-black rounded-full bg-flat-red transition duration-300 group-hover:translate-y-2.5"></div>
          )}
        </Link>
        <Link
          to="/admin/settings"
          className="w-3/4 block mx-auto relative my-4 before:content-[''] before:inline-block before:absolute before:z-[-1] before:inset-0 before:rounded-full before:bg-green-lime before:border-black before:border-2 group"
        >
          <span className="relative z-[2] w-full block border-2 border-black text-black px-3 py-2 rounded-full text-center shadow-md bg-white transition -translate-y-2.5 group-hover:-translate-y-0">Réglages</span>
        </Link>
        <h2 className="font-sans text-center uppercase">Gestion des données</h2>
        <Link
          to="/admin/matchs"
          className="w-3/4 block mx-auto relative my-4 before:content-[''] before:inline-block before:absolute before:z-[-1] before:inset-0 before:rounded-full before:bg-green-lime before:border-black before:border-2 group"
        >
          <span className="relative z-[2] w-full block border-2 border-black text-black px-3 py-2 rounded-full text-center shadow-md bg-white transition -translate-y-2.5 group-hover:-translate-y-0">Données des matchs</span>
        </Link>
        <Link
          to="/admin/teams"
          className="w-3/4 block mx-auto relative my-4 before:content-[''] before:inline-block before:absolute before:z-[-1] before:inset-0 before:rounded-full before:bg-green-lime before:border-black before:border-2 group"
        >
          <span className="relative z-[2] w-full block border-2 border-black text-black px-3 py-2 rounded-full text-center shadow-md bg-white transition -translate-y-2.5 group-hover:-translate-y-0">Données des équipes</span>
        </Link>
        <Link
          to="/admin/players"
          className="w-3/4 block mx-auto relative my-4 before:content-[''] before:inline-block before:absolute before:z-[-1] before:inset-0 before:rounded-full before:bg-green-lime before:border-black before:border-2 group"
        >
          <span className="relative z-[2] w-full block border-2 border-black text-black px-3 py-2 rounded-full text-center shadow-md bg-white transition -translate-y-2.5 group-hover:-translate-y-0">Données des joueurs</span>
        </Link>
      </div>
    </div>
  );
}

export default Admin;