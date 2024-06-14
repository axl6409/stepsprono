// Homepage.jsx
import React, {useState, useEffect} from 'react';
import { motion, useIsPresent } from "framer-motion";
import {Link} from "react-router-dom";
import background from "../assets/components/background-hexagon.svg";
import logo from "/img/Logo.svg";
import icon150x143 from "/img/your-icon-150x143.png";
import icon522x498 from "/img/your-icon-522x498.png";

const Home = () => {
  const isPresent = useIsPresent();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    });
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        setDeferredPrompt(null);
      });
    }
  };

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
          {isVisible && (
            <button onClick={handleInstallClick} className="w-4/5 relative my-4 mx-auto">
              <span className="relative z-[2] w-full block border border-black text-black uppercase font-regular text-l font-roboto px-3 py-2 rounded-full text-center shadow-md bg-white transition -translate-y-2 group-hover:-translate-y-0">Ajouter à l'écran d'accueil</span>
              <img src={icon150x143} alt="Icon 150x143" />
            </button>
          )}
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
