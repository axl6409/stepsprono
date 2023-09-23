import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '/img/steps-prono-logo.svg';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBars, faXmark} from "@fortawesome/free-solid-svg-icons";

const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white p-4 relative z-[10] border-b border-black">
      <div className="container mx-auto flex justify-between items-center">

        {/* Logo */}
        <Link to="/">
          <img src={logo} alt="Logo" className="h-8 w-auto"/>
        </Link>

        {/* Burger Button */}
        <button
          className="block"
          onClick={() => setIsOpen(!isOpen)}
        >
          <FontAwesomeIcon icon={faBars} className="h-[30px]"/>
        </button>

        {/* Links */}
        <div className={`${isOpen ? 'right-0' : 'right-[-50%]'} flex items-center fixed top-0 bottom-0 w-2/4 flex-col justify-start bg-white p-8 transition-all duration-200 shadow-menu`}>
          <button
            className="block ml-auto"
            onClick={() => setIsOpen(!isOpen)}
          >
            <FontAwesomeIcon icon={faXmark} className="h-[40px]"/>
          </button>
          <Link
            to="/login"
            className="w-3/5 relative my-4 before:content-[''] before:inline-block before:absolute before:z-[-1] before:inset-0 before:rounded-full before:bg-green-lime before:border-black before:border-2 group"
            onClick={() => setIsOpen(false)}
          >
            <span className="relative z-[2] w-full block border-2 border-black text-black px-3 py-2 rounded-full text-center shadow-md bg-white transition border-black group-hover:-translate-y-2.5">Login</span>
          </Link>
          <Link
            to="/register"
            className="w-3/5 relative my-4 before:content-[''] before:inline-block before:absolute before:z-[-1] before:inset-0 before:rounded-full before:bg-green-lime before:border-black before:border-2 group"
            onClick={() => setIsOpen(false)}
          >
            <span className="relative z-[2] w-full block border-2 border-black text-black px-3 py-2 rounded-full text-center shadow-md bg-white transition border-black group-hover:-translate-y-2.5">Register</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default UserMenu;
