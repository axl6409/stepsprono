import React, {useEffect, useState, useContext} from 'react';
import {UserContext} from "../contexts/UserContext.jsx";
import {Link} from "react-router-dom";
import futbol from "/img/futbol-solid.svg";
import {useCookies} from "react-cookie";
import axios from "axios";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faChevronDown, faHourglassHalf} from "@fortawesome/free-solid-svg-icons";
import CurrentBets from "./user/CurrentBets.jsx";
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const Dashboard = () => {
  const { user, updateUserStatus } = useContext(UserContext);
  const [cookies, setCookie] = useCookies(["user"]);
  const token = localStorage.getItem('token') || cookies.token

  return (
    <div className="text-center relative py-10 px-2 flex flex-col justify-center">
      <span className="absolute top-10 left-4 text-xl text-black">
        <img className="w-[30px]" src={futbol} alt="football icon"/>
      </span>
      <span className="absolute top-10 right-4 text-xl text-black">
        <img className="w-[30px]" src={futbol} alt="football icon"/>
      </span>
      <h1 className="text-3xl font-black my-8 mt-0 uppercase relative w-fit mx-auto">Steps Prono
        <span className="absolute left-0 bottom-0 text-flat-purple z-[-1] transition-all duration-700 ease-in-out delay-500 -translate-x-0.5 translate-y-0.5">Steps Prono</span>
        <span className="absolute left-0 bottom-0 text-green-lime z-[-2] transition-all duration-700 ease-in-out delay-700 -translate-x-1 translate-y-1">Steps Prono</span>
      </h1>

      <div>
        <CurrentBets user={user} token={token} />
      </div>
    </div>
  );
}

export default Dashboard;
