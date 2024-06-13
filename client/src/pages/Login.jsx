import React, {useContext, useState} from 'react'
import { motion, useIsPresent } from "framer-motion";
import axios from "axios";
import { Link, useNavigate } from 'react-router-dom';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAt, faKey} from "@fortawesome/free-solid-svg-icons";
import { CookiesProvider, useCookies } from "react-cookie";
import {UserContext} from "../contexts/UserContext.jsx";
import background from "../assets/components/background-hexagon-large.png";
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';
import arrowLeft from "../assets/icons/arrow-left.svg";
import userIcon from "../assets/icons/user.svg";
import lockIcon from "../assets/icons/password.svg";

const Login = () => {
  const isPresent = useIsPresent();
  const { setIsAuthenticated } = useContext(UserContext);
  const [cookies, setCookie] = useCookies(["user"]);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${apiUrl}/api/login`, formData);
      localStorage.setItem('token', response.data.token);
      setCookie('token', response.data.token, { path: '/' });
      setIsAuthenticated(true);
      navigate('/dashboard');
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        setErrorMessage(error.response.data.error);
      } else {
        setErrorMessage('Une erreur s’est produite: ' + error);
      }
    }
  }

  return (
    <div className="w-full h-100vh">
      <div className="h-4/5 relative z-[2] bg-cover bg-no-repeat bg-bottom flex flex-col justify-center px-4"
           style={{backgroundImage: `url(${background})`}}>
        <div
          className="block relative border-2 border-black w-full mx-auto bg-white rounded-xl">
          <Link
            to="/"
            className="relative block w-fit rounded-full mt-2 ml-2 before:content-[''] before:absolute before:z-[1] before:w-[30px] before:h-[30px] before:inset-0 before:rounded-full before:bg-black before:border-black before:border group"
          >
            <img
              className="relative z-[2] w-[30px] h-[30px] block border-2 border-black text-black uppercase font-regular text-l font-roboto px-1 py-1 rounded-full text-center shadow-md bg-white transition -translate-y-0.5 group-hover:-translate-y-0"
              src={arrowLeft} alt="Icone de retour"/>
          </Link>
          <h2
            className={`
            font-black 
            font-rubik 
            my-8 
            mt-0 
            capitalize 
            relative 
            w-fit 
            mx-auto 
            text-xl6
            before:content-['Hello!']
            before:absolute
            before:inset-0
            before:z-[2]
            before:translate-x-1
            before:translate-y-1
            before:text-xl6
            before:text-purple-soft
            after:content-['Hello!']
            after:absolute
            after:inset-0
            after:z-[1]
            after:translate-x-2
            after:translate-y-2
            after:text-xl6
            after:text-green-soft
            `}>
            <span className="relative z-[3]">Hello!</span>
          </h2>
          <p className="font-sans text-sm font-medium text-center">{errorMessage}</p>
          <form onSubmit={handleSubmit} className="flex flex-col items-center px-8">
            <label htmlFor="username" className="my-4 w-full relative flex flex-row justify-start">
              <div className="w-[15%] absolute -top-4 -left-4 -rotate-2 flex flex-col justify-center">
                <img src={userIcon} alt="icone de l'utilisateur"/>
              </div>
              <input
                type="text"
                name="username"
                placeholder="Pseudo"
                value={formData.username}
                onChange={handleChange}
                className="p-3 w-full bg-white border border-black rounded-full text-center font-roboto text-base font-regular focus:outline-none placeholder:text-grey-soft"
              />
            </label>
            <label htmlFor="password" className="my-4 w-full relative flex flex-row justify-start">
              <div className="w-[20%] absolute -top-4 -right-8 -rotate-2 flex flex-col justify-center">
                <img src={lockIcon} alt="icone de l'utilisateur"/>
              </div>
              <input
                type="password"
                name="password"
                placeholder="Mot de passe"
                value={formData.password}
                onChange={handleChange}
                className="p-3 w-full bg-white border border-black rounded-full text-center font-roboto text-base font-regular focus:outline-none placeholder:text-grey-soft"
              />
            </label>
            <button
              type="submit"
              className="w-4/5 relative mb-8 mt-8 mx-auto before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-black before:border-black before:border group"
            >
              <span
                className="relative z-[2] w-full block border border-black text-black uppercase font-regular text-l font-roboto px-3 py-2 rounded-full text-center shadow-md bg-purple-soft transition -translate-y-1.5 group-hover:-translate-y-0">Connexion</span>
            </button>
          </form>
        </div>
      </div>
      <div className="p-8 h-[30%] bg-purple-light relative z-[1] mt-[-17%] flex flex-col justify-center">
        <p className="font-roboto font-regular text-sm text-center">Pas encore de compte ?</p>
        <Link to="/register" className="underline font-roboto text-base font-medium text-center">Inscrivez-vous !</Link>
      </div>
      <motion.div
        initial={{scaleX: 1}}
        animate={{scaleX: 0, transition: {duration: 0.5, ease: "circOut"}}}
        exit={{scaleX: 1, transition: {duration: 0.5, ease: "circIn"}}}
        style={{originX: isPresent ? 0 : 1}}
        className="fixed inset-0 bg-green-soft z-[5]"
      />
    </div>
  )
}

export default Login;
