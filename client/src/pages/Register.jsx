import React, {useContext, useState} from 'react'
import axios from "axios";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAt, faKey, faUser} from "@fortawesome/free-solid-svg-icons";
import {useNavigate} from "react-router-dom";
import {useCookies} from "react-cookie";
import {UserContext} from "../contexts/UserContext.jsx";
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const Register = () => {
  const [cookies, setCookie] = useCookies(["user"]);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  })
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated, setIsAuthenticated } = useContext(UserContext);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(`${apiUrl}/api/register`, {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        setCookie('token', response.data.token, { path: '/' });
        setIsAuthenticated(true);
        navigate('/reglement');
      } else {
        console.error('Token is missing in response', response.data);
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        setErrorMessage(error.response.data.error);
      } else {
        setErrorMessage('Une erreur s’est produite: ' + error);
      }
    }
  }

  return (
    <div className="w-full h-100vh pt-10">
      <div className="block py-10 px-6 border-2 border-black w-11/12 mx-auto relative bg-white shadow-md before:content-[''] before:block before:absolute before:inset-0 before:z-[-1] before:translate-x-4 before:translate-y-4 before:bg-green-lime before:border-2 before:border-black">
        <h1 className="text-center mb-8 text-xl font-title uppercase font-bold">Créer un compte</h1>
        <p className="font-sans text-sm font-medium text-center">{errorMessage}</p>
        <form action="" onSubmit={handleSubmit} className="flex flex-col items-center">
          <label htmlFor="username" className="my-4 w-full border-2 border-black flex flex-row justify-start">
            <div className="w-[15%] flex flex-col justify-center">
              <FontAwesomeIcon icon={faUser} className="w-[25px] h-[25px] mx-auto"/>
            </div>
            <input
              type="text"
              name="username"
              placeholder="Nom d'utilisateur"
              value={formData.username}
              onChange={handleChange}
              className="p-3 w-[85%] bg-white font-sans border-l-2 border-black focus:outline-none placeholder:text-black"
              />
          </label>
          <label htmlFor="email" className="my-4 w-full border-2 border-black flex flex-row justify-start">
            <div className="w-[15%] flex flex-col justify-center">
              <FontAwesomeIcon icon={faAt} className="w-[25px] h-[25px] mx-auto" />
            </div>
            <input
              type="email"
              name="email"
              placeholder="adresse@email.com"
              value={formData.email}
              onChange={handleChange}
              className="p-3 w-[85%] bg-white font-sans border-l-2 border-black focus:outline-none placeholder:text-black"
              />
          </label>
          <label htmlFor="password" className="my-4 w-full border-2 border-black flex flex-row justify-start">
            <div className="w-[15%] flex flex-col justify-center">
              <FontAwesomeIcon icon={faKey} className="w-[25px] h-[25px] mx-auto" />
            </div>
            <input
              type="password"
              name="password"
              placeholder="M0t2P44ssSuperSéCu%"
              value={formData.password}
              onChange={handleChange}
              className="p-3 w-[85%] bg-white font-sans border-l-2 border-black focus:outline-none placeholder:text-black"
              />
          </label>
          <button
            type="submit"
            className="w-3/5 relative my-4 outline-none before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-green-lime before:border-black before:border-2 group"
            >
            <span className="relative z-[2] w-full block border-2 border-black text-black px-3 py-2 rounded-full text-center shadow-md bg-white transition group-hover:-translate-y-2.5 group-focus:-translate-y-2.5">Créer le compte</span>
          </button>
        </form>
      </div>
    </div>
  )
}

export default Register