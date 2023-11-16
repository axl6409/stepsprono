// Homepage.jsx
import React, {useContext} from 'react';
import {Link} from "react-router-dom";
import {UserContext} from "../contexts/UserContext.jsx";

const Home = () => {
  const { isAuthenticated } = useContext(UserContext);

  return (
    <div className="text-center p-10 h-70vh flex flex-col justify-center">
      <h1 className="text-3xl font-black my-8 uppercase relative w-fit mx-auto">Steps Prono
        <span className="absolute left-0 bottom-0 text-flat-purple z-[-1] transition-all duration-700 ease-in-out delay-500 -translate-x-0.5 translate-y-0.5">Steps Prono</span>
        <span className="absolute left-0 bottom-0 text-green-lime z-[-2] transition-all duration-700 ease-in-out delay-700 -translate-x-1 translate-y-1">Steps Prono</span>
      </h1>
      <p className="text-lg font-bold mb-4">⚽️ Bienvenue sur Steps Prono ⚽️</p>

      <p className="text-lg mb-6">
        Votre nouvelle plateforme de paris sportifs en ligne !
      </p>

      <div className="flex flex-col justify-evenly">
        {isAuthenticated ? (
          <Link
            to="/dashboard"
            className="w-full relative my-4 before:content-[''] before:inline-block before:absolute before:z-[-1] before:inset-0 before:rounded-full before:bg-green-lime before:border-black before:border-2 group"
          >
            <span className="relative z-[2] w-full block border-2 border-black text-black px-3 py-2 rounded-full text-center shadow-md bg-white transition -translate-y-2.5 group-hover:-translate-y-0">Tableau de bord</span>
          </Link>
        ) : (
          <>
            <Link
              to="/login"
              className="w-full relative my-4 before:content-[''] before:inline-block before:absolute before:z-[-1] before:inset-0 before:rounded-full before:bg-green-lime before:border-black before:border-2 group"
            >
              <span className="relative z-[2] w-full block border-2 border-black text-black px-3 py-2 rounded-full text-center shadow-md bg-white transition -translate-y-2.5 group-hover:-translate-y-0">Connexion</span>
            </Link>
            <Link
              to="/register"
              className="w-full relative my-4 before:content-[''] before:inline-block before:absolute before:z-[-1] before:inset-0 before:rounded-full before:bg-green-lime before:border-black before:border-2 group"
            >
              <span className="relative z-[2] w-full block border-2 border-black text-black px-3 py-2 rounded-full text-center shadow-md bg-white transition -translate-y-2.5 group-hover:-translate-y-0">Inscription</span>
            </Link>
          </>
        )}
        </div>
    </div>
  );
}

export default Home;
