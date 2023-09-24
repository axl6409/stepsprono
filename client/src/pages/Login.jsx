import React, { useState } from 'react'
import axios from "axios";
import { Link, useNavigate } from 'react-router-dom';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAt, faKey} from "@fortawesome/free-solid-svg-icons";

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errorMessage, setErrorMessage] = useState('');
  const history = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://127.0.0.1:3001/api/login', formData);
      localStorage.setItem('token', response.data.token);
      history('/dashboard');
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
      <div className="p-10 border-2 border-black w-[60%] mx-auto mt-20 relative bg-white shadow-md">
        <h1 className="text-center mb-8 text-xl font-title uppercase font-bold">Se connecter</h1>
        <p className="font-sans text-sm font-medium text-center">{errorMessage}</p>
        <form onSubmit={handleSubmit} className="flex flex-col items-center">
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
              className="p-3 w-[75%] bg-white font-sans border-l-2 border-black focus:outline-none placeholder:text-black"
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
              className="p-3 w-[75%] bg-white font-sans border-l-2 border-black focus:outline-none placeholder:text-black"
            />
          </label>
          <button
            type="submit"
            className="w-3/5 relative my-4 outline-none before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-green-lime before:border-black before:border-2 group"
          >
            <span className="relative z-[2] w-full font-sans text-sm font-medium block border-2 border-black text-black px-3 py-2 rounded-full text-center shadow-md bg-white transition border-black group-hover:-translate-y-2.5 group-focus:-translate-y-2.5">Connexion</span>
          </button>
          <Link to="/register" className="text-black transition font-sans text-sm font-medium">Pas encore de compte? <span className="underline">Inscrivez-vous</span></Link>
        </form>
      </div>
    </div>
  )
}

export default Login;
