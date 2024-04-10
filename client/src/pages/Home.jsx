// Homepage.jsx
import React, {useContext} from 'react';
import {Link} from "react-router-dom";
import {UserContext} from "../contexts/UserContext.jsx";
import background from "../assets/components/background-hexagon-2.png";
import logo from "/img/Logo.svg";

const Home = () => {
  const { isAuthenticated } = useContext(UserContext);
  console.log(logo)
  return (
    <>
    <div className="p-10 relative flex flex-col justify-center">
      <div className="absolute left-0 top-0 right-0 h-1/2 z-[1] bg-cover bg-center" style={{backgroundImage: `url(${background})`, backgroundSize: '200%', backgroundPosition: 'bottom center' }}></div>
      <div className="relative top-20 z-[2]">
        <img className="mx-auto w-4/6 my-4" src={logo} alt="Logo de l'application Steps Prono"/>
      </div>
      <div className="relative z-[3] flex flex-col justify-evenly mt-[30%]">
        <>
          <Link
            to="/login"
            className="w-4/5 relative my-4 mx-auto before:content-[''] before:inline-block before:absolute before:z-[-1] before:inset-0 before:rounded-full before:bg-purple-soft before:border-black before:border group"
          >
            <span className="relative z-[2] w-full block border border-black text-black uppercase font-regular text-l font-roboto px-3 py-2 rounded-full text-center shadow-md bg-white transition -translate-y-2 group-hover:-translate-y-0">Connexion</span>
          </Link>
          <Link
            to="/register"
            className="w-4/5 relative my-4 mx-auto before:content-[''] before:inline-block before:absolute before:z-[-1] before:inset-0 before:rounded-full before:bg-green-medium before:border-black before:border group"
          >
            <span className="relative z-[2] w-full block border border-black text-black uppercase font-regular text-l font-roboto px-3 py-2 rounded-full text-center shadow-md bg-white transition -translate-y-2 group-hover:-translate-y-0">Inscription</span>
          </Link>
        </>
      </div>
    </div>
    </>
  );
}

export default Home;
