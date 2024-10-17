import React, {useContext, useState, useEffect, useRef} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import menuBallon from '../../assets/components/icons/menu-ballon.png';
import navHome from '../../assets/components/icons/nav-accueil.svg';
import navPronos from '../../assets/components/icons/nav-pronos.svg';
import navRanking from '../../assets/components/icons/nav-classement.svg';
import navStepsRanking from '../../assets/components/icons/nav-steps.svg';
import navProfile from '../../assets/components/icons/nav-profil.svg';
import navClose from '../../assets/icons/nav-cross.svg';
import navLogout from '../../assets/components/icons/nav-logout.svg';
import navAdmin from '../../assets/components/icons/nav-admin.svg';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
  faArrowsRotate,
  faChevronLeft,
  faStopwatch,
} from "@fortawesome/free-solid-svg-icons";
import {UserContext} from "../../contexts/UserContext.jsx";
import {AppContext} from "../../contexts/AppContext.jsx";
import {useCookies} from "react-cookie";
import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { isDebuggerActive, isDebuggerOpen, toggleDebuggerModal, isCountDownPopupOpen, toggleCountDownModal, matchsCronTasks, fetchMatchsCronJobs} = useContext(AppContext);
  const [cookies] = useCookies(['token']);
  const token = localStorage.getItem('token') || cookies.token;
  const { user, isAuthenticated, logout } = useContext(UserContext);
  const { menuOpen, setMenuOpen } = useContext(AppContext);
  const [debugEnabled, setDebugEnabled] = useState(false);
  const [countdown, setCountdown] = useState({});
  const [cronTasks, setCronTasks] = useState([]);
  const [firstMatchDate, setFirstMatchDate] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const debugCookie = cookies.debug === 'true';
    setDebugEnabled(debugCookie);
  }, [cookies]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuRef]);

  useEffect(() => {
    const fetchFirstMatchDate = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/matchs/current-week`, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });
        const matchs = response.data.data;
        if (matchs.length > 0) {
          const firstMatch = new Date(matchs[0].utc_date);
          setFirstMatchDate(firstMatch);
        } else {
          setFirstMatchDate(null);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des matchs :", error);
      }
    };

    fetchFirstMatchDate();
  }, [cookies.token]);

  useEffect(() => {
    if (!firstMatchDate) {
      setCountdown({
        hidden: true
      })
      return;
    }

    const interval = setInterval(() => {
      const now = new Date();
      const firstMatchDay = new Date(firstMatchDate);
      firstMatchDay.setHours(0, 0, 0, 0);

      const midday = new Date(firstMatchDay);
      midday.setHours(12, 0, 0, 0);

      const endOfWeek = new Date(firstMatchDay);
      endOfWeek.setDate(firstMatchDay.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      if (now >= firstMatchDay && now < midday) {
        const timeLeft = midday - now;
        const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
        const seconds = Math.floor((timeLeft / 1000) % 60);

        setCountdown({
          hours,
          minutes,
          seconds,
          expired: false,
          hidden: false
        });
      } else if (now >= midday && now <= endOfWeek) {
        setCountdown({
          expired: true,
          hidden: false
        });
      } else {
        setCountdown({
          hidden: true
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [firstMatchDate]);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  const toggleMenu = () => {
    setMenuOpen(prev => !prev);
  };

  return (
    <>
      <header className="fixed bottom-1 right-1 z-[9999]" ref={menuRef}>
        <nav className="px-2 py-2 relative z-[10]">
          {user && (
            <button
              className="relative z-[80] w-[70px] h-[70px] before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-black before:border-black before:border-2 group"
              onClick={toggleMenu}
            >
              <span
                className="relative z-[2] w-full h-full flex flex-col justify-center bg-no-repeat bg-cover bg-center border-2 border-black text-black px-1 py-1 rounded-full text-center shadow-md bg-white transition -translate-y-1 -translate-x-0.5 group-hover:-translate-y-0 group-hover:-translate-x-0">
                <img src={menuBallon} alt=""/>
              </span>
            </button>
          )}
          <div className={`${menuOpen ? 'translate-x-0 translate-y-0 scale-100' : 'translate-x-[100%] translate-y-[100%] scale-0'} flex flex-col justify-between border border-black fixed z-[70] bottom-0 right-0 w-4/5 bg-white p-8 pb-24 rounded-t-3xl rounded-bl-3xl transition-all duration-200 shadow-menu`}>
            {isAuthenticated && (
              <>
                <div className="flex flex-row justify-between">
                  <button
                    className="relative z-[80] w-[30px] h-[30px] before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-black before:border-black before:border-2 group"
                    onClick={toggleMenu}
                  >
                    <span
                      className="relative z-[2] w-full h-full flex flex-col justify-center bg-green-soft bg-no-repeat bg-cover bg-center border-2 border-black text-black px-0.5 py-0.5 rounded-full text-center shadow-md transition -translate-y-1 -translate-x-0.5 group-hover:-translate-y-0 group-hover:-translate-x-0">
                      <img src={navClose} alt="close menu icon"/>
                    </span>
                  </button>
                  <Link
                    to="/"
                    className="relative z-[80] w-[30px] h-[30px] before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-black before:border-black before:border-2 group"
                    onClick={handleLogout}
                  >
                    <span
                      className="relative z-[2] w-full h-full flex flex-col justify-center bg-blue-medium bg-no-repeat bg-cover bg-center border-2 border-black text-black px-0.5 py-0.5 rounded-full text-center shadow-md transition -translate-y-1 -translate-x-0.5 group-hover:-translate-y-0 group-hover:-translate-x-0">
                      <img className='p-1' src={navLogout} alt="close menu icon"/>
                    </span>
                  </Link>
                </div>
                <div className="mt-8 h-60vh flex flex-col justify-between">
                  <Link
                    to="/dashboard"
                    className="w-full relative group flex flex-row justify-between items-center rounded-2xl transition-colors border-2 border-white duration-200 ease-linear hover:bg-blue-light hover:shadow-lg hover:border-black focus:bg-blue-light focus:shadow-lg focus:border-black focus:outline-none"
                    onClick={toggleMenu}
                  >
                    <span className="inline-block w-1/5">
                      <img className="h-[20px] mx-auto" src={navHome} alt="Icône accueil"/>
                    </span>
                    <span className="inline-block no-correct w-4/5 font-roboto text-black px-3 py-2 text-left">Accueil</span>
                  </Link>
                  <Link
                    to="/matchs/history"
                    className="w-full relative group flex flex-row justify-between items-center rounded-2xl transition-colors border-2 border-white duration-200 ease-linear hover:bg-blue-light hover:shadow-lg hover:border-black focus:bg-blue-light focus:shadow-lg focus:border-black focus:outline-none"
                    onClick={toggleMenu}
                  >
                    <span className="inline-block w-1/5">
                      <img className="h-[20px] mx-auto" src={navPronos} alt="Icône mes pronos"/>
                    </span>
                    <span className="inline-block no-correct w-4/5 font-roboto text-black px-3 py-2 text-left">Mes pronos</span>
                  </Link>
                  <Link
                    to="/teams"
                    className="w-full relative group flex flex-row justify-between items-center rounded-2xl transition-colors border-2 border-white duration-200 ease-linear hover:bg-blue-light hover:shadow-lg hover:border-black focus:bg-blue-light focus:shadow-lg focus:border-black focus:outline-none"
                    onClick={toggleMenu}
                  >
                    <span className="inline-block w-1/5">
                      <img className="h-[20px] mx-auto" src={navRanking} alt="Icône classement équipes"/>
                    </span>
                    <span className="inline-block no-correct w-4/5 font-roboto text-black px-3 py-2 text-left">Classement équipes</span>
                  </Link>
                  <Link
                    to="/classement"
                    className="w-full relative group flex flex-row justify-between items-center rounded-2xl transition-colors border-2 border-white duration-200 ease-linear hover:bg-blue-light hover:shadow-lg hover:border-black focus:bg-blue-light focus:shadow-lg focus:border-black focus:outline-none"
                    onClick={toggleMenu}
                  >
                    <span className="inline-block w-1/5">
                      <img className="h-[20px] mx-auto" src={navStepsRanking} alt="Icône classement steps"/>
                    </span>
                    <span className="inline-block no-correct w-4/5 font-roboto text-black px-3 py-2 text-left">Classement Steps</span>
                  </Link>
                  <Link
                    to="/user/settings"
                    className="w-full relative group flex flex-row justify-between items-center rounded-2xl transition-colors border-2 border-white duration-200 ease-linear hover:bg-blue-light hover:shadow-lg hover:border-black focus:bg-blue-light focus:shadow-lg focus:border-black focus:outline-none"
                    onClick={toggleMenu}
                  >
                    <span className="inline-block w-1/5">
                      <img className="h-[20px] mx-auto" src={navProfile} alt="Icône profil"/>
                    </span>
                    <span className="inline-block no-correct w-4/5 font-roboto text-black px-3 py-2 text-left">Mon profil</span>
                  </Link>

                  {user && user.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="w-full relative group flex flex-row justify-between items-center rounded-2xl transition-colors border-2 border-white duration-200 ease-linear hover:bg-blue-light hover:shadow-lg hover:border-black focus:bg-blue-light focus:shadow-lg focus:border-black focus:outline-none"
                      onClick={toggleMenu}
                    >
                      <span className="inline-block w-1/5">
                        <img className="h-[20px] mx-auto" src={navAdmin} alt="Icône administration"/>
                      </span>
                      <span className="inline-block no-correct w-4/5 font-roboto text-black px-3 py-2 text-left">Administration</span>
                    </Link>
                  )}
                </div>
              </>
            )}
          </div>
        </nav>
      </header>
      {isAuthenticated && user && user.role !== 'visitor' && (
        <div id="countdownPoup"
             className={`${countdown.hidden ? 'hidden' : ''} fixed z-[70] top-28 left-0 px-2 py-2 border-2 border-black shadow-flat-black-adjust bg-deep-red transition-transform duration-300 ease-in-out ${isCountDownPopupOpen ? '-translate-x-0' : 'translate-x-[-101%]'} `}>
          {!countdown.expired && (
            <p className="font-sans no-correct text-sm text-white font-bold">Fin des pronostics dans :</p>
          )}
          <p className="font-sans text-sm text-white text-center">
            {!countdown.expired ? (
              <>
                <span
                  className="bg-white no-correct border border-black shadow-flat-black-adjust text-black font-title font-black text-base inline-block my-auto w-8 leading-4 py-0.5 px-1 mx-0.5">{countdown.hours}</span>
                <span className="bg-white no-correct border border-black shadow-flat-black-adjust text-black font-title font-black text-base inline-block my-auto w-8 leading-4 py-0.5 px-1 mx-0.5">{countdown.minutes}</span>
                <span className="bg-white no-correct border border-black shadow-flat-black-adjust text-black font-title font-black text-base inline-block my-auto w-8 leading-4 py-0.5 px-1 mx-0.5">{countdown.seconds}</span>
              </>
            ) : (
              <span className="bg-white no-correct border border-black shadow-flat-black-adjust text-black font-title font-black text-base inline-block my-auto leading-4 py-0.5 px-1 mx-0.5">Pronostics fermés</span>
            )}
          </p>
          <button className="absolute no-correct right-[-32px] top-[-2px] bg-deep-red px-2 border-r-2 border-t-2 border-b-2 rounded-r-lg border-black shadow-flat-black-adjust focus:outline-none" onClick={toggleCountDownModal}>
            <FontAwesomeIcon icon={faStopwatch} className="font-sans text-sm text-white" />
          </button>
        </div>
      )}
      {user && user.role === 'admin' && isDebuggerActive && (
        <div className={`debugger fixed z-[80] max-w-[94%] right-0.5 top-0.5 transition-transform duration-300 ease-in-out ${isDebuggerOpen ? 'translate-x-0' : 'translate-x-full'} before:content-[''] before:absolute before:inset-0 before:bg-green-lime before:-translate-x-0.5 before:translate-y-0.5 before:border before:border-black before:z-[1]`}>
          <button
            className={`absolute no-correct z-[2] block h-5 w-6 top-0 -left-4 bg-black text-left pl-1 focus:outline-none`}
            onClick={toggleDebuggerModal}
          >
            <FontAwesomeIcon icon={faChevronLeft} className={`text-green-lime-deep text-xs inline-block align-[0] transition-transform duration-300 ease-in-out ${isDebuggerOpen ? 'rotate-180' : 'rotate-0'}`} />
          </button>
          <div className="bg-black px-2 py-2 relative z-[2] flex flex-col">
            <div className="flex flex-row mb-2">
              <button
                onClick={() => fetchAPICalls()}
                className="relative no-correct block h-fit mr-2 -mb-1 before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded before:bg-green-lime before:border-black before:border-2 group"
              >
            <span
              className="relative no-correct z-[2] w-full flex flex-row justify-center border-2 border-black text-black px-0.5 py-0.5 rounded text-center text-xs font-sans uppercase font-bold shadow-md bg-white transition translate-y-[-3px] translate-x-[-3px] group-hover:-translate-y-0 group-hover:-translate-x-0">
              <FontAwesomeIcon icon={faArrowsRotate}/>
            </span>
              </button>
              <p className="font-title no-correct font-bold text-green-lime-deep leading-4 my-auto w-[200px]">
                <span className="inline-block no-correct mr-0.5">API Calls : </span>
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
    </>
  );
};

export default UserMenu;
