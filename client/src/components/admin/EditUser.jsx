import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {useCookies} from "react-cookie";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircleXmark, faPen} from "@fortawesome/free-solid-svg-icons";

const EditUser = () => {
  const [users, setUsers] = useState([]);
  const [cookies] = useCookies(['token']);
  const token = localStorage.getItem('token') || cookies.token

  useEffect(() => {
    const fetchUsers = async () => {

    };

    fetchUsers();
  }, []);


  return (
    <div className="py-3.5 px-6 bg-flat-yellow mx-2.5 border-2 border-black shadow-flat-black">
      <ul className="flex flex-col justify-start">
        {users.map(user => (
          <li className="flex flex-row justify-between" key={user.id}>
            <p className="username font-title font-bold text-xl leading-6 border-2 border-black bg-white py-1 px-4 h-fit shadow-flat-black">{user.username}</p>
            <div className="flex flex-row">
              <button
                onClick={() => handleEditUser(user.id)}
                className="relative m-2 block h-fit before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-green-lime before:border-black before:border-2 group"
              >
                  <span className="relative z-[2] w-full flex flex-row justify-center border-2 border-black text-black px-2 py-1.5 rounded-full text-center font-sans uppercase font-bold shadow-md bg-white transition -translate-y-1 -translate-x-0.5 group-hover:-translate-y-0 group-hover:-translate-x-0">
                    <FontAwesomeIcon icon={faPen} />
                  </span>
              </button>
              <button
                onClick={() => handleDeleteUser(user.id)}
                className="relative m-2 block h-fit before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-green-lime before:border-black before:border-2 group"
              >
                  <span className="relative z-[2] w-full flex flex-row justify-center border-2 border-black text-black px-2 py-1.5 rounded-full text-center font-sans uppercase font-bold shadow-md bg-white transition -translate-y-1 -translate-x-0.5 group-hover:-translate-y-0 group-hover:-translate-x-0">
                    <FontAwesomeIcon icon={faCircleXmark} />
                  </span>
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default EditUser;
