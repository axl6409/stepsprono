// src/components/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-gray-200 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link
          to="/"
          className="text-gray-800 text-xl font-bold hover:text-gray-900 transition"
        >
          Accueil
        </Link>
        <div className="space-x-4">
          <Link
            to="/login"
            className="text-gray-800 hover:text-gray-900 transition px-3 py-2 rounded-md shadow-md hover:shadow-lg"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="text-gray-800 hover:text-gray-900 transition px-3 py-2 rounded-md shadow-md hover:shadow-lg"
          >
            Register
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
