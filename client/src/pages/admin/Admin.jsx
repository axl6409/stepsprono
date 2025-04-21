import React, {useContext, useEffect, useState} from 'react';
import {UserContext} from "../../contexts/UserContext.jsx";
import {Link, Navigate, useNavigate} from "react-router-dom";
import BackButton from "../../components/nav/BackButton.jsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAdjust, faCaretLeft} from "@fortawesome/free-solid-svg-icons";
import {useCookies} from "react-cookie";
import {AppContext} from "../../contexts/AppContext.jsx";
import axios from "axios";
import StatusModal from "../../components/partials/modals/StatusModal.jsx";
import arrowIcon from "../../assets/icons/arrow-left.svg";
import SimpleTitle from "../../components/partials/SimpleTitle.jsx";
import DashboardButton from "../../components/nav/DashboardButton.jsx";
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const Admin = () => {
  const { user } = useContext(UserContext)
  const { userRequests } = useContext(AppContext)
  const [cookies] = useCookies(['token']);
  const token = localStorage.getItem('token') || cookies.token
  const navigate = useNavigate();
  const { isDebuggerActive, toggleDebugger } = useContext(AppContext);
  const [nullBets, setNullBets] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updateStatus, setUpdateStatus] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');

  const closeModal = () => {
    setUpdateStatus(false);
    setUpdateMessage('');
    setIsModalOpen(false);
  };

  return (
    <div className="inline-block w-full h-auto py-20 overflow-x-hidden">
      {isModalOpen && (
        <StatusModal message={updateMessage} status={updateStatus} closeModal={closeModal}/>
      )}
      <DashboardButton />
      <SimpleTitle title={"Administration"} stickyStatus={false} fontSize={'2rem'} uppercase={true} />
      <div className="py-4 block">
        <div
          className="w-[90%] hidden h-full flex flex-row justify-between items-center bg-flat-blue border-2 border-black mx-auto shadow-flat-black-adjust py-2 px-8">
          <p className="font-sans text-sm font-medium text-white">Fenêtre de debug</p>
          <div className="flex justify-center items-center">
            <button
              className={`w-14 h-7 flex items-center rounded-full border-2 border-black mx-3 px-1 shadow-flat-black-adjust focus:outline-none ${isDebuggerActive ? 'bg-green-lime-deep' : 'bg-gray-400'}`}
              onClick={toggleDebugger}
            >
              <div
                className={`bg-white w-5 h-5 rounded-full border-2 border-black shadow-md transition-transform duration-200 ease-out transform ${isDebuggerActive ? 'translate-x-6' : ''}`}></div>
            </button>
          </div>
        </div>
      </div>
      <div className="py-4 block">
        <h2 className="font-roboto font-bold text-xl text-center uppercase">Application</h2>
        <div className="flex flex-row flex-wrap justify-evenly items-center mb-8">
          <div className="w-1/2 px-3">
            <Link
              to="/admin/users"
              className="w-full block mx-auto relative my-4 before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-green-lime before:border-black before:border-2 group"
            >
              <span
                className="relative z-[2] w-full block border-2 border-black text-black px-3 py-2 rounded-full text-center shadow-md bg-white transition duration-300 -translate-y-2 group-hover:-translate-y-0">Utilisateurs</span>
              {userRequests && userRequests.length > 0 && (
                <div
                  className="absolute z-[3] right-0 -top-2 translate-x-1 translate-y-1 w-4 h-4 border-2 border-black rounded-full bg-flat-red transition duration-300 group-hover:translate-y-2.5"></div>
              )}
            </Link>
          </div>
          {user && user.role === 'admin' && (
            <div className="w-1/2 px-3">
              <Link
                to="/admin/rewards"
                className="w-full block mx-auto relative my-4 before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-green-lime before:border-black before:border-2 group"
              >
                <span
                  className="relative z-[2] w-full block border-2 border-black text-black px-3 py-2 rounded-full text-center shadow-md bg-white transition -translate-y-2 group-hover:-translate-y-0">Trophées</span>
              </Link>
            </div>
          )}
          <div className="w-1/2 px-3">
            <Link
              to="/admin/settings"
              className="w-full block mx-auto relative my-4 before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-green-lime before:border-black before:border-2 group"
            >
            <span
              className="relative z-[2] w-full block border-2 border-black text-black px-3 py-2 rounded-full text-center shadow-md bg-white transition -translate-y-2 group-hover:-translate-y-0">Réglages</span>
            </Link>
          </div>
          {user && user.role === 'admin' && (
            <div className="w-1/2 px-3">
              <Link
                to="/admin/notifications"
                className="w-full block mx-auto relative my-4 before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-green-lime before:border-black before:border-2 group"
              >
              <span
                className="relative z-[2] w-full block border-2 border-black text-black px-3 py-2 rounded-full text-center shadow-md bg-white transition -translate-y-2 group-hover:-translate-y-0">Notifications</span>
                </Link>
            </div>
          )}
        </div>
        <h2 className="font-roboto font-bold text-xl text-center uppercase">Gestion des données</h2>
        <div className="flex flex-row flex-wrap justify-evenly items-center">
          {user && user.role === 'admin' && (
            <>
              <div className="w-1/2 px-3">
                <Link
                  to="/admin/competitions"
                  className="w-full block mx-auto relative my-4 before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-green-lime before:border-black before:border-2 group"
                >
              <span
                className="relative z-[2] w-full block border-2 border-black text-black px-3 py-2 rounded-full text-center shadow-md bg-white transition -translate-y-2 group-hover:-translate-y-0">Compétitions</span>
                </Link>
              </div>
              <div className="w-1/2 px-3">
                <Link
                  to="/admin/seasons"
                  className="w-full block mx-auto relative my-4 before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-green-lime before:border-black before:border-2 group"
                >
              <span
                className="relative z-[2] w-full block border-2 border-black text-black px-3 py-2 rounded-full text-center shadow-md bg-white transition -translate-y-2 group-hover:-translate-y-0">Saisons</span>
                </Link>
              </div>
              <div className="w-1/2 px-3">
                <Link
                  to="/admin/teams"
                  className="w-full block mx-auto relative my-4 before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-green-lime before:border-black before:border-2 group"
                >
                <span
                  className="relative z-[2] w-full block border-2 border-black text-black px-3 py-2 rounded-full text-center shadow-md bg-white transition -translate-y-2 group-hover:-translate-y-0">Équipes</span>
                    </Link>
                  </div>
                  <div className="w-1/2 px-3">
                    <Link
                      to="/admin/players"
                      className="w-full block mx-auto relative my-4 before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-green-lime before:border-black before:border-2 group"
                    >
                    <span
                      className="relative z-[2] w-full block border-2 border-black text-black px-3 py-2 rounded-full text-center shadow-md bg-white transition -translate-y-2 group-hover:-translate-y-0">Joueurs</span>
                </Link>
              </div>
            </>
          )}
          <div className="w-1/2 px-3">
            <Link
              to="/admin/matchs"
              className="w-full block mx-auto relative my-4 before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-green-lime before:border-black before:border-2 group"
            >
            <span
              className="relative z-[2] w-full block border-2 border-black text-black px-3 py-2 rounded-full text-center shadow-md bg-white transition -translate-y-2 group-hover:-translate-y-0">Matchs</span>
            </Link>
          </div>
          {user && user.role === 'admin' && (
            <div className="w-1/2 px-3">
              <Link
                to="/admin/bets"
                className="w-full block mx-auto relative my-4 before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-green-lime before:border-black before:border-2 group"
              >
              <span
                className="relative z-[2] w-full block border-2 border-black text-black px-3 py-2 rounded-full text-center shadow-md bg-white transition -translate-y-2 group-hover:-translate-y-0">Pronostics</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Admin;