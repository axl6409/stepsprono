import React, {useContext, useEffect} from 'react';
import {Link, useNavigate} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCirclePlus} from "@fortawesome/free-solid-svg-icons";
import {UserContext} from "../contexts/UserContext.jsx";


const Matchs = () => {
  const { user, setUser } = useContext(UserContext)
  const navigate = useNavigate()

  useEffect(() => {

  })

  return (
    <div className="text-center p-10 h-70vh flex flex-col justify-center">
      <h1 className="text-3xl font-bold mb-4">Matchs</h1>
      {user && user.role === 'admin' && (
        <button
          className="group w-fit px-2.5 py-0.5 bg-white shadow-flat-black-adjust border-r-2 border-l-2 border-b-2 border-black rounded-br-xl rounded-bl-xl font-title text-l uppercase font-bold"
          onClick={() => navigate('/matchs/edit', { state: { mode: 'add' } })}>
          <FontAwesomeIcon icon={faCirclePlus} className="inline-block align-[-2px]" />
        </button>
      )}
      <div>
        <h2>Prochains Matchs</h2>
        <div>
          <ul>
            <li>Match 1</li>
            <li>Match 2</li>
            <li>Match 3</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Matchs;
