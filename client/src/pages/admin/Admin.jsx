import React, {useContext, useEffect, useState} from 'react';
import {UserContext} from "../../contexts/UserContext.jsx";
import {Link, Navigate, useNavigate} from "react-router-dom";
import BackButton from "../../components/nav/BackButton.jsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAdjust, faCaretLeft} from "@fortawesome/free-solid-svg-icons";
import {useCookies} from "react-cookie";
import {AppContext} from "../../contexts/AppContext.jsx";
import axios from "axios";
import StatusModal from "../../components/modals/StatusModal.jsx";
import arrowIcon from "../../assets/icons/arrow-left.svg";
import SimpleTitle from "../../components/partials/SimpleTitle.jsx";
import DashboardButton from "../../components/nav/DashboardButton.jsx";
import JoystickButton from "../../components/buttons/JoystickButton.jsx";
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const Admin = () => {
  const { user } = useContext(UserContext)
  const { hasTreasurerAccess, hasManagerAccess, hasTwiceAccess, hasAdminAccess, isAdmin } = useContext(UserContext);
  const [cookies] = useCookies(['token']);
  const token = localStorage.getItem('token') || cookies.token
  const navigate = useNavigate();
  const { userRequests, isDebuggerActive, toggleDebugger, setIsDebuggerActive } = useContext(AppContext);
  const [nullBets, setNullBets] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updateStatus, setUpdateStatus] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');

  const closeModal = () => {
    setUpdateStatus(false);
    setUpdateMessage('');
    setIsModalOpen(false);
  };
  console.log(isDebuggerActive)
  return (
    <div className="inline-block relative z-20 w-full h-auto py-20 overflow-x-hidden">
      {isModalOpen && (
        <StatusModal message={updateMessage} status={updateStatus} closeModal={closeModal}/>
      )}
      <DashboardButton />
      <SimpleTitle title={"Admin Space"} stickyStatus={false} fontSize={'2.5rem'} uppercase={true} />

      <div className="absolute z-[2] h-fit w-fit top-8 right-1/2 translate-x-1/2 flex flex-row justify-center items-center">
        <p className="text-center font-roboto uppercase -mt-2 font-black">Debug Mode</p>
        <JoystickButton checked={isDebuggerActive} mode={isDebuggerActive === true ? "checked" : "trigger"} onChange={() => toggleDebugger()} />
      </div>


      <div className="py-4 block mt-8 border border-black bg-white rounded-xl overflow-hidden w-11/12 mx-auto shadow-flat-black">
        <h2 className="font-roboto font-bold text-xl text-center uppercase">Gestion de l'application</h2>
        <div className="flex flex-row flex-wrap justify-evenly items-center mb-8">
          <div className="w-1/2 px-3">
            <Link
              to="/admin/users"
              className="w-full fade-in block relative my-4 mx-auto before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-black before:border-black before:border group"
            >
              <span
                translate="no"
                className="no-correct relative z-[2] w-full block border border-black text-black uppercase font-regular text-xs font-roboto px-3 py-2 rounded-full text-center shadow-md bg-yellow-light transition -translate-y-1 group-hover:-translate-y-0">Utilisateurs</span>
              {userRequests && userRequests.length > 0 && (
                <div
                  className="absolute z-[3] right-0 -top-2 translate-x-1 translate-y-1 w-4 h-4 border-2 border-black rounded-full bg-flat-red transition duration-300 group-hover:translate-y-2.5"></div>
              )}
            </Link>
          </div>
          {hasAdminAccess && (
            <div className="w-1/2 px-3">
              <Link
                to="/admin/rewards"
                className="w-full fade-in block relative my-4 mx-auto before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-black before:border-black before:border group"
              >
                <span
                  translate="no"
                  className="no-correct relative z-[2] w-full block border border-black text-black uppercase font-regular text-xs font-roboto px-3 py-2 rounded-full text-center shadow-md bg-yellow-light transition -translate-y-1 group-hover:-translate-y-0">Trophées</span>
              </Link>
            </div>
          )}
          <div className="w-1/2 px-3">
            <Link
              to="/admin/settings"
              className="w-full fade-in block relative my-4 mx-auto before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-black before:border-black before:border group"
            >
            <span
              translate="no"
              className="no-correct relative z-[2] w-full block border border-black text-black uppercase font-regular text-xs font-roboto px-3 py-2 rounded-full text-center shadow-md bg-green-light transition -translate-y-1 group-hover:-translate-y-0">Réglages</span>
            </Link>
          </div>
          <div className="w-1/2 px-3">
            <Link
              to="/admin/rules"
              className="w-full fade-in block relative my-4 mx-auto before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-black before:border-black before:border group"
            >
              <span
                translate="no"
                className="no-correct relative z-[2] w-full block border border-black text-black uppercase font-regular text-xs font-roboto px-0 py-2 rounded-full text-center shadow-md bg-green-light transition -translate-y-1 group-hover:-translate-y-0">Règles Spéciales</span>
            </Link>
          </div>
          {hasAdminAccess && (
            <div className="w-1/2 px-3">
              <Link
                to="/admin/notifications"
                className="w-full fade-in block relative my-4 mx-auto before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-black before:border-black before:border group"
              >
              <span
                translate="no"
                className="no-correct relative z-[2] w-full block border border-black text-black uppercase font-regular text-xs font-roboto px-3 py-2 rounded-full text-center shadow-md bg-purple-light transition -translate-y-1 group-hover:-translate-y-0">Notifications</span>
                </Link>
            </div>
          )}
        </div>
        <h2 className="font-roboto font-bold text-xl text-center uppercase">Gestion des données</h2>
        <div className="flex flex-row flex-wrap justify-evenly items-center">
          {hasAdminAccess && (
            <>
              <div className="w-1/2 px-3">
                <Link
                  to="/admin/competitions"
                  className="w-full fade-in block relative my-4 mx-auto before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-black before:border-black before:border group"
                >
                  <span
                    translate="no"
                    className="no-correct relative z-[2] w-full block border border-black text-black uppercase font-regular text-xs font-roboto px-3 py-2 rounded-full text-center shadow-md bg-blue-light transition -translate-y-1 group-hover:-translate-y-0">Compétitions</span>
                </Link>
              </div>
              <div className="w-1/2 px-3">
                <Link
                  to="/admin/seasons"
                  className="w-full fade-in block relative my-4 mx-auto before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-black before:border-black before:border group"
                >
                  <span
                    translate="no"
                    className="no-correct relative z-[2] w-full block border border-black text-black uppercase font-regular text-xs font-roboto px-3 py-2 rounded-full text-center shadow-md bg-blue-light transition -translate-y-1 group-hover:-translate-y-0">Saisons</span>
                </Link>
              </div>
            </>
          )}
          <div className="w-1/2 px-3">
            <Link
              to="/admin/teams"
              className="w-full fade-in block relative my-4 mx-auto before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-black before:border-black before:border group"
            >
              <span
                translate="no"
                className="no-correct relative z-[2] w-full block border border-black text-black uppercase font-regular text-xs font-roboto px-3 py-2 rounded-full text-center shadow-md bg-blue-light transition -translate-y-1 group-hover:-translate-y-0">Équipes</span>
            </Link>
          </div>
          <div className="w-1/2 px-3">
            <Link
              to="/admin/players"
              className="w-full fade-in block relative my-4 mx-auto before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-black before:border-black before:border group"
            >
              <span
                translate="no"
                className="no-correct relative z-[2] w-full block border border-black text-black uppercase font-regular text-xs font-roboto px-3 py-2 rounded-full text-center shadow-md bg-blue-light transition -translate-y-1 group-hover:-translate-y-0">Joueurs</span>
            </Link>
          </div>
          <div className="w-1/2 px-3">
            <Link
              to="/admin/matchs"
              className="w-full fade-in block relative my-4 mx-auto before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-black before:border-black before:border group"
            >
            <span
              translate="no"
              className="no-correct relative z-[2] w-full block border border-black text-black uppercase font-regular text-xs font-roboto px-3 py-2 rounded-full text-center shadow-md bg-blue-light transition -translate-y-1 group-hover:-translate-y-0">Matchs</span>
            </Link>
          </div>
          <div className="w-1/2 px-3">
            <Link
              to="/admin/bets"
              className="w-full fade-in block relative my-4 mx-auto before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-black before:border-black before:border group"
            >
            <span
              translate="no"
              className="no-correct relative z-[2] w-full block border border-black text-black uppercase font-regular text-xs font-roboto px-3 py-2 rounded-full text-center shadow-md bg-blue-light transition -translate-y-1 group-hover:-translate-y-0">Pronostics</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;