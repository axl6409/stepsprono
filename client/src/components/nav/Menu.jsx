import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button
        className="lg:hidden block outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="block relative h-0.5 w-5 bg-current transform transition duration-500 ease-in-out"></span>
        <span className="block relative h-0.5 w-5 bg-current mt-1.5 transform transition duration-500 ease-in-out"></span>
        <span className="block relative h-0.5 w-5 bg-current mt-1.5 transform transition duration-500 ease-in-out"></span>
      </button>

      {/* Links */}
      <div className={`lg:flex items-center ${isOpen ? 'block' : 'hidden'}`}>
        <Link
          to="/login"
          className="text-gray-800 hover:text-gray-900 transition px-3 py-2 rounded-md shadow-md hover:shadow-lg lg:mx-2 mt-2 lg:mt-0"
          onClick={() => setIsOpen(false)}
        >
          Login
        </Link>
        <Link
          to="/register"
          className="text-gray-800 hover:text-gray-900 transition px-3 py-2 rounded-md shadow-md hover:shadow-lg lg:mx-2 mt-2 lg:mt-0"
          onClick={() => setIsOpen(false)}
        >
          Register
        </Link>
      </div>
    </div>
  );
};

export default UserMenu;
