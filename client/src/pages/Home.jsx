// Homepage.jsx
import React, {useContext} from 'react';
import { motion, useIsPresent } from "framer-motion";
import {Link} from "react-router-dom";
import {UserContext} from "../contexts/UserContext.jsx";
import background from "../assets/components/background-hexagon.svg";
import logo from "/img/Logo.svg";

const Home = () => {
  const isPresent = useIsPresent();
  const { isAuthenticated } = useContext(UserContext);
  console.log(logo)
  return (
    <>
      <div className="h-100vh flex flex-col justify-start">
        <div className="h-40vh bg-cover bg-center bg-no-repeat" style={{backgroundImage: `url(${background})`}}></div>
        <div className="block -mt-40">
          <img className="w-auto mx-auto pl-8" src={logo} alt="Logo de l'application Steps Prono"/>
        </div>
        <div className="flex flex-col justify-evenly mt-12">
          <>
            <Link
              to="/login"
              className="w-4/5 relative my-4 mx-auto before:content-[''] before:inline-block before:absolute before:z-[-1] before:inset-0 before:rounded-full before:bg-purple-soft before:border-black before:border group"
            >
              <span
                className="relative z-[2] w-full block border border-black text-black uppercase font-regular text-l font-roboto px-3 py-2 rounded-full text-center shadow-md bg-white transition -translate-y-2 group-hover:-translate-y-0">Connexion</span>
            </Link>
            <Link
              to="/register"
              className="w-4/5 relative my-4 mx-auto before:content-[''] before:inline-block before:absolute before:z-[-1] before:inset-0 before:rounded-full before:bg-green-medium before:border-black before:border group"
            >
              <span
                className="relative z-[2] w-full block border border-black text-black uppercase font-regular text-l font-roboto px-3 py-2 rounded-full text-center shadow-md bg-white transition -translate-y-2 group-hover:-translate-y-0">Inscription</span>
            </Link>
          </>
        </div>
        <motion.div
          initial={{scaleX: 1}}
          animate={{scaleX: 0, transition: {duration: 0.5, ease: "circOut"}}}
          exit={{scaleX: 1, transition: {duration: 0.5, ease: "circIn"}}}
          style={{originX: isPresent ? 0 : 1}}
          className="fixed inset-0 bg-green-soft z-[5]"
        />
      </div>
    </>
  );
}

export default Home;
