import React, {useContext, useState, useEffect} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import logo from '/img/steps-prono-logo.svg';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
  faArrowsRotate,
  faBars, faChevronLeft,
  faCircleUser,
  faCloudArrowDown,
  faRightFromBracket, faStopwatch,
  faXmark
} from "@fortawesome/free-solid-svg-icons";
import {UserContext} from "../../contexts/UserContext.jsx";
import {AppContext} from "../../contexts/AppContext.jsx";
import axios from "axios";
import {useCookies} from "react-cookie";
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isDebuggerActive, isDebuggerOpen, toggleDebuggerModal, isCountDownPopupOpen, toggleCountDownModal, matchsCronTasks, fetchMatchsCronJobs} = useContext(AppContext);
  const [cookies] = useCookies(['token']);
  const token = localStorage.getItem('token') || cookies.token
  const { user, isAuthenticated, logout } = useContext(UserContext);
  const { apiCalls, fetchAPICalls } = useContext(AppContext);
  const [debugEnabled, setDebugEnabled] = useState(false);
  const [countdown, setCountdown] = useState({});
  const [cronTasks, setCronTasks] = useState([]);
  let cleanImageUrl = '/src/assets/react.svg'

  if (isAuthenticated && user) {
    let profilImg = '/src/assets/react.svg'
    if (user.img) {
      profilImg = user.img.replace(/(\.[^/.]+)$/, '_120x120$1')
    }
    cleanImageUrl = profilImg.replace(/\\/g, '/').replace(/^\.\.\//, '').replace(/ /g, '%20');
  }
  const navigate = useNavigate();

  useEffect(() => {
    const debugCookie = cookies.debug === 'true';
    setDebugEnabled(debugCookie);
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const nextFriday = new Date();
      nextFriday.setDate(now.getDate() + (5 - now.getDay() + 7) % 7 + 1);
      nextFriday.setHours(12, 0, 0, 0);
      const endFriday = new Date(nextFriday.getTime());
      endFriday.setHours(23, 59, 59, 999);
      const lastMonday = new Date(now);
      lastMonday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      lastMonday.setHours(0, 0, 0, 0);

      const timeLeft = endFriday - now;

      if (timeLeft > 0 && now >= nextFriday) {
        const totalSeconds = Math.floor(timeLeft / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const formattedTime = {hours: hours, minutes: minutes, seconds: seconds, expired: false};
        setCountdown({
          countdown: formattedTime,
          expired: false,
          hidden: false
        });
      } else if (now >= lastMonday && now <= nextFriday) {
        setCountdown({
          expired: true,
          hidden: true
        });
      } else {
        setCountdown({
          expired: true,
          hidden: false
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [])

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  return (
    <>
    <header className="fixed bottom-1 left-1 right-1 z-[90]">
      <nav className="bg-white px-2 py-2 relative z-[10] border-2 border-black rounded-tl-3xl rounded-tr-3xl rounded-br-md rounded-bl-md shadow-flat-black-adjust">
        <div className="container mx-auto flex justify-between items-center">
          {isAuthenticated && user ? (
            <Link
              className="relative z-[60] w-[50px] h-[50px] before:content-[''] before:inline-block before:absolute before:z-[-1] before:inset-0 before:rounded-full before:bg-green-lime before:border-black before:border-2 group"
              to="/dashboard">
              <span
                className="relative z-[2] w-full h-full flex flex-col justify-center bg-no-repeat bg-cover bg-center border-2 border-black text-black px-0.5 py-0.5 rounded-full text-center shadow-md bg-white transition -translate-y-1 -translate-x-0.5 group-hover:-translate-y-0 group-hover:-translate-x-0"
              >
                <img src={logo} alt="Logo" className="w-auto h-[50px]"/>
              </span>
            </Link>
          ) : (
            <Link
              className="relative z-[60] w-[50px] h-[50px] before:content-[''] before:inline-block before:absolute before:z-[-1] before:inset-0 before:rounded-full before:bg-green-lime before:border-black before:border-2 group"
              to="/">
              <span
                className="relative z-[2] w-full h-full flex flex-col justify-center bg-no-repeat bg-cover bg-center border-2 border-black text-black px-0.5 py-0.5 rounded-full text-center shadow-md bg-white transition -translate-y-1 -translate-x-1 group-hover:-translate-y-0 group-hover:-translate-x-0"
              >
                <img src={logo} alt="Logo" className="w-auto h-[50px]"/>
              </span>
            </Link>
          )}
          {isAuthenticated && user ? (
            <>
              <p className="font-sans font-medium text-sm bg-white px-2 py-1 text-black border-2 border-black shadow-flat-black-adjust">{user.username}</p>
              <button
                className="relative z-[80] w-[50px] h-[50px] before:content-[''] before:inline-block before:absolute before:z-[-1] before:inset-0 before:rounded-full before:bg-green-lime before:border-black before:border-2 group"
                onClick={() => setIsOpen(!isOpen)}>
                <span
                  className="relative z-[2] w-full h-full flex flex-col justify-center bg-no-repeat bg-cover bg-center border-2 border-black text-black px-0.5 py-0.5 rounded-full text-center shadow-md bg-white transition -translate-y-1 -translate-x-0.5 group-hover:-translate-y-0 group-hover:-translate-x-0"
                  style={{ backgroundImage: `url(${cleanImageUrl})` }}
                >
                </span>
              </button>
            </>
          ) : (
            <button
              className="relative z-[80] w-[50px] h-[50px] before:content-[''] before:inline-block before:absolute before:z-[-1] before:inset-0 before:rounded-full before:bg-green-lime before:border-black before:border-2 group"
              onClick={() => setIsOpen(!isOpen)}
            >
              <span
                className="relative z-[2] w-full h-full flex flex-col justify-center bg-no-repeat bg-cover bg-center border-2 border-black text-black px-0.5 py-0.5 rounded-full text-center shadow-md bg-white transition -translate-y-1 -translate-x-1 group-hover:-translate-y-0 group-hover:-translate-x-0">
                {isOpen ? <FontAwesomeIcon icon={faXmark} className="h-[25px]" /> : <FontAwesomeIcon icon={faBars} className="h-[25px]" />}
              </span>
            </button>
          )}
          <div className={`${isOpen ? 'top-0' : 'top-[100%]'} flex flex-col justify-between border-4 border-black fixed z-[70] left-0 bottom-0 right-0 w-[100%] bg-white p-8 pb-16 transition-all duration-200 shadow-menu`}>
            {isAuthenticated ? (
              <>
                <div className="flex flex-row justify-between">
                  <Link
                    to="/user/settings"
                    className="w-auto block relative my-4 before:content-[''] before:inline-block before:absolute before:z-[-1] before:shadow-inner-black-light before:inset-0 before:rounded-full before:bg-green-lime before:border-black before:border-2 group"
                    onClick={() => setIsOpen(!isOpen)}
                  >
                  <span className="relative z-[2] w-full block border-2 border-black text-black px-3 py-2 rounded-full text-center shadow-md bg-white transition -translate-y-1.5 group-hover:-translate-y-0">
                    <FontAwesomeIcon icon={faCircleUser} />
                  </span>
                  </Link>
                  <Link
                    to="/"
                    className="w-auto block relative my-4 before:content-[''] before:inline-block before:absolute before:z-[-1] before:shadow-inner-black-light before:inset-0 before:rounded-full before:bg-green-lime before:border-black before:border-2 group"
                    onClick={handleLogout}
                  >
                  <span className="relative z-[2] w-full block border-2 border-black text-black px-3 py-2 rounded-full text-center shadow-md bg-white transition -translate-y-1.5 group-hover:-translate-y-0">
                    <FontAwesomeIcon icon={faRightFromBracket} />
                  </span>
                  </Link>
                </div>
                <div>
                <Link
                  to="/dashboard"
                  className="w-full block relative my-4 before:content-[''] before:inline-block before:absolute before:z-[-1] before:shadow-inner-black-light before:inset-0 before:rounded-full before:bg-green-lime before:border-black before:border-2 group"
                  onClick={() => setIsOpen(!isOpen)}
                >
                  <span className="relative z-[2] w-full block border-2 border-black text-black px-3 py-2 rounded-full text-center shadow-md bg-white transition -translate-y-2.5 group-hover:-translate-y-0">Tableau de bord</span>
                </Link>
                <Link
                  to="/teams"
                  className="w-full block relative my-4 before:content-[''] before:inline-block before:absolute before:z-[-1] before:shadow-inner-black-light before:inset-0 before:rounded-full before:bg-green-lime before:border-black before:border-2 group"
                  onClick={() => setIsOpen(!isOpen)}
                >
                  <span className="relative z-[2] w-full block border-2 border-black text-black px-3 py-2 rounded-full text-center shadow-md bg-white transition -translate-y-2.5 group-hover:-translate-y-0">Classement Équipes</span>
                </Link>
                <Link
                  to="/matchs"
                  className="w-full block relative my-4 before:content-[''] before:inline-block before:absolute before:z-[-1] before:shadow-inner-black-light before:inset-0 before:rounded-full before:bg-green-lime before:border-black before:border-2 group"
                  onClick={() => setIsOpen(!isOpen)}
                >
                  <span className="relative z-[2] w-full block border-2 border-black text-black px-3 py-2 rounded-full text-center shadow-md bg-white transition -translate-y-2.5 group-hover:-translate-y-0">Matchs / Pronos</span>
                </Link>
                <Link
                  to="/classement"
                  className="w-full block relative my-4 before:content-[''] before:inline-block before:absolute before:z-[-1] before:inset-0 before:rounded-full before:shadow-inner-black-light before:bg-green-lime before:border-black before:border-2 group"
                  onClick={() => setIsOpen(!isOpen)}
                >
                  <span className="relative z-[2] w-full block border-2 border-black text-black px-3 py-2 rounded-full text-center shadow-md bg-white transition -translate-y-2.5 group-hover:-translate-y-0">Classement Steps</span>
                </Link>
                {user && user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="w-full block relative my-4 before:content-[''] before:inline-block before:absolute before:z-[-1] before:shadow-inner-black-light before:inset-0 before:rounded-full before:bg-green-lime before:border-black before:border-2 group"
                    onClick={() => setIsOpen(!isOpen)}
                  >
                    <span className="relative z-[2] w-full block border-2 border-black text-black px-3 py-2 rounded-full text-center shadow-md bg-white transition -translate-y-2.5 group-hover:-translate-y-0">Administration</span>
                  </Link>
                )}
              </div>
              </>
            ) : (
              <>
                <div className="flex flex-col justify-center">
                  <Link
                    to="/login"
                    className="w-full block relative my-4 before:content-[''] before:inline-block before:absolute before:z-[-1] before:shadow-inner-black-light before:inset-0 before:rounded-full before:bg-green-lime before:border-black before:border-2 group"
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="relative z-[2] w-full block border-2 border-black text-black px-3 py-2 rounded-full text-center shadow-md bg-white transition -translate-y-2.5 group-hover:-translate-y-0">Connexion</span>
                  </Link>
                  <Link
                    to="/register"
                    className="w-full block relative my-4 before:content-[''] before:inline-block before:absolute before:z-[-1] before:shadow-inner-black-light before:inset-0 before:rounded-full before:bg-green-lime before:border-black before:border-2 group"
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="relative z-[2] w-full block border-2 border-black text-black px-3 py-2 rounded-full text-center shadow-md bg-white transition -translate-y-2.5 group-hover:-translate-y-0">Inscription</span>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
    {isAuthenticated && user && user.role === 'admin' && isDebuggerActive && (
      <div className={`debugger fixed z-[80] max-w-[94%] right-0.5 top-0.5 transition-transform duration-300 ease-in-out ${isDebuggerOpen ? 'translate-x-0' : 'translate-x-full'} before:content-[''] before:absolute before:inset-0 before:bg-green-lime before:-translate-x-0.5 before:translate-y-0.5 before:border before:border-black before:z-[1]`}>
        <button
          className={`absolute z-[2] block h-5 w-6 top-0 -left-4 bg-black text-left pl-1 focus:outline-none`}
          onClick={toggleDebuggerModal}
        >
          <FontAwesomeIcon icon={faChevronLeft} className={`text-green-lime-deep text-xs inline-block align-[0] transition-transform duration-300 ease-in-out ${isDebuggerOpen ? 'rotate-180' : 'rotate-0'}`} />
        </button>
        <div className="bg-black px-2 py-2 relative z-[2] flex flex-col">
          <div className="flex flex-row mb-2">
            <button
              onClick={() => fetchAPICalls()}
              className="relative block h-fit mr-2 -mb-1 before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded before:bg-green-lime before:border-black before:border-2 group"
            >
            <span
              className="relative z-[2] w-full flex flex-row justify-center border-2 border-black text-black px-0.5 py-0.5 rounded text-center text-xs font-sans uppercase font-bold shadow-md bg-white transition translate-y-[-3px] translate-x-[-3px] group-hover:-translate-y-0 group-hover:-translate-x-0">
              <FontAwesomeIcon icon={faArrowsRotate}/>
            </span>
            </button>
            <p className="font-title font-bold text-green-lime-deep leading-4 my-auto w-[200px]">
              <span className="inline-block mr-0.5">API Calls : </span>
              {apiCalls.current !== undefined ? (
                <>
                  <span className={`inline-block font-bold ${
                    apiCalls.current >= (3 / 4 * apiCalls.limit_day) ? 'text-red-600' :
                      apiCalls.current >= (1 / 3 * apiCalls.limit_day) ? 'text-orange-500' :
                        'text-green-lime-deep'
                  }`}>{apiCalls.current}</span>
                  <span className="inline-block">/</span>
                  <span className="inline-block">{apiCalls.limit_day}</span>
                </>
              ) : (
                <span className="inline-block">{apiCalls.error_message}</span>
              )}
            </p>
          </div>
          <div>
            <p className="font-title font-bold text-green-lime-deep">Cron Tasks</p>
            <div
              className="overflow-y-scroll overflow-x-scroll max-w-[250px] max-h-[100px] border-t border-l border-green-lime-deep">
              <ul className="flex flex-col w-max">
                {cronTasks && cronTasks.length > 0 ? (
                  cronTasks.map((task, index) => <li key={index}><p
                    className="font-sans text-xxs text-green-lime-deep font-light">{task.task} - {task.schedule}</p>
                  </li>)
                ) : (
                  <p>Aucune tâche programmée</p>
                )}
              </ul>
            </div>
          </div>
          <div>
            <p className="font-title font-bold text-green-lime-deep">Next Matchs Updates</p>
            <div
              className="overflow-y-scroll overflow-x-scroll max-w-[250px] max-h-[100px] border-t border-l border-green-lime-deep">
              <ul className="flex flex-col w-max">
                {matchsCronTasks && matchsCronTasks.length > 0 ? (
                  matchsCronTasks.map((task, index) => <li key={index}><p
                    className="font-sans text-xxs text-green-lime-deep font-light">{task.id} - {task.cronTime}</p>
                  </li>)
                ) : (
                  <p>Aucune tâche programmée</p>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    )}
    {isAuthenticated && user && user.role !== 'visitor' && (
      <div id="countdownPoup" className={`${countdown.hidden ? `hidden` : `` } fixed z-[70] top-20 left-0 px-2 py-2 border-2 border-black shadow-flat-black-adjust bg-deep-red transition-transform duration-300 ease-in-out ${isCountDownPopupOpen ? '-translate-x-0' : 'translate-x-[-101%]'} `}>
          {!countdown.expired && (
            <p className="font-sans text-sm text-white font-bold">Fin des pronostic dans :</p>
          )}
          <p className="font-sans text-sm text-white text-center">
            {!countdown.expired ? (
              <>
                <span
                  className="bg-white border border-black shadow-flat-black-adjust text-black font-title font-black text-base inline-block my-auto w-8 leading-4 py-0.5 px-1 mx-0.5">{countdown.hours}</span>
              <span className="bg-white border border-black shadow-flat-black-adjust text-black font-title font-black text-base inline-block my-auto w-8 leading-4 py-0.5 px-1 mx-0.5">{countdown.minutes}</span>
              <span className="bg-white border border-black shadow-flat-black-adjust text-black font-title font-black text-base inline-block my-auto w-8 leading-4 py-0.5 px-1 mx-0.5">{countdown.seconds}</span>
            </>
          ) : (
            <span className="bg-white border border-black shadow-flat-black-adjust text-black font-title font-black text-base inline-block my-auto leading-4 py-0.5 px-1 mx-0.5">Pronostics fermés</span>
          )}
        </p>
        <button className="absolute right-[-32px] top-[-2px] bg-deep-red px-2 border-r-2 border-t-2 border-b-2 border-black shadow-flat-black-adjust focus:outline-none" onClick={toggleCountDownModal}>
          <FontAwesomeIcon icon={faStopwatch} className="font-sans text-sm text-white" />
        </button>
      </div>
    )}
    </>
  );
};

export default UserMenu;