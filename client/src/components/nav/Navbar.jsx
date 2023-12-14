import React, {useContext, useState, useEffect} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import logo from '/img/steps-prono-logo.svg';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBars, faCircleUser, faRightFromBracket, faXmark} from "@fortawesome/free-solid-svg-icons";
import {UserContext} from "../../contexts/UserContext.jsx";
import axios from "axios";
import {useCookies} from "react-cookie";
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const UserMenu = () => {
  const [cookies] = useCookies(['token']);
  const token = localStorage.getItem('token') || cookies.token
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, logout } = useContext(UserContext);
  const [apiCalls, setApiCalls] = useState({});
  let cleanImageUrl = '/src/assets/react.svg'

  if (isAuthenticated && user) {
    let profilImg = '/src/assets/react.svg'
    if (user.img) {
      profilImg = user.img.replace(/(\.[^/.]+)$/, '_120x120$1')
    }
    cleanImageUrl = profilImg.replace(/\\/g, '/').replace(/^\.\.\//, '').replace(/ /g, '%20');
  }
  const navigate = useNavigate();

  const fetchAPICalls = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/app/api/calls`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      const data = await response;
      setApiCalls(data.data.calls.response.requests);
    } catch (error) {
      console.error(error);
    }
  }

  if (user.role === 'admin') {
    useEffect(() => {
      fetchAPICalls();
    }, [])
  }

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
    {user.role === 'admin' && (
      <div className="fixed z-[80] right-0.5 top-0.5 before:content-[''] before:absolute before:inset-0 before:bg-green-lime before:-translate-x-0.5 before:translate-y-0.5 before:border before:border-black before:z-[1]">
        <div className="bg-black px-2 py-0.5 relative z-[2]">
          <p className="font-title font-bold text-green-lime-deep leading-4">
            <span className="inline-block mr-0.5">API Calls : </span>
            <span className={`inline-block font-bold ${
              apiCalls.current >= (3/4 * apiCalls.limit_day) ? 'text-red-600' :
                apiCalls.current >= (1/3 * apiCalls.limit_day) ? 'text-orange-500' :
                  'text-green-lime-deep'
            }`}>{apiCalls.current}</span>
            <span className="inline-block">/</span>
            <span className="inline-block">{apiCalls.limit_day}</span>
          </p>
        </div>
      </div>
    )}
    </>
  );
};

export default UserMenu;
