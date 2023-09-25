// Homepage.jsx
import React from 'react';
import {Link} from "react-router-dom";

const Home = () => {
  return (
    <div className="text-center p-10 h-70vh flex flex-col justify-center">
      <h1 className="text-3xl font-bold mb-4">⚽️ Bienvenue sur Steps Prono ⚽️</h1>

      <p className="text-lg mb-6">
        Votre nouvelle plateforme de paris sportifs en ligne !
      </p>

      <div className="flex flex-col justify-evenly">
        <Link
          to="/login"
          className="w-full relative my-4 before:content-[''] before:inline-block before:absolute before:z-[-1] before:inset-0 before:rounded-full before:bg-green-lime before:border-black before:border-2 group"
        >
          <span className="relative z-[2] w-full block border-2 border-black text-black px-3 py-2 rounded-full text-center shadow-md bg-white transition group-hover:-translate-y-2.5">Login</span>
        </Link>

        <Link
          to="/register"
          className="w-full relative my-4 before:content-[''] before:inline-block before:absolute before:z-[-1] before:inset-0 before:rounded-full before:bg-green-lime before:border-black before:border-2 group"
        >
          <span className="relative z-[2] w-full block border-2 border-black text-black px-3 py-2 rounded-full text-center shadow-md bg-white transition group-hover:-translate-y-2.5">Register</span>
        </Link>
        </div>
    </div>
  );
}

export default Home;
