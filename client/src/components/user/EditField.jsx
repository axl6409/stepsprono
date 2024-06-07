import React, { useState } from 'react';
import axios from 'axios';
import {Link} from "react-router-dom";
import arrowIcon from "../../assets/icons/arrow-left.svg";
import checkedIcon from "../../assets/icons/checked-green.svg";
import BgUser from "../partials/user/BgUser.jsx";
import BgEmail from "../partials/user/BgEmail.jsx";
import BgPassword from "../partials/user/BgPassword.jsx";
import BgTeam from "../partials/user/BgTeam.jsx";

const EditField = ({ title, fieldName, fieldLabel, user, token, setUser, type = "text" }) => {
  const [value, setValue] = useState(user[fieldName]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await axios.put(
        `${apiUrl}/api/user/update/${user.id}`,
        { [fieldName]: value },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setUser(response.data);
      setLoading(false);
    } catch (error) {
      setError('Erreur lors de la mise à jour');
      setLoading(false);
    }
  };

  return (
    <div className="relative inline-block w-full h-100vh pt-20">
      {fieldName === 'username' && (
        <BgUser />
      )}
      {fieldName === 'email' && (
        <BgEmail />
      )}
      {fieldName === 'password' && (
        <BgPassword />
      )}
      {fieldName === 'team' && (
        <BgTeam />
      )}
      <Link
        to="/dashboard"
        className="swiper-button-prev w-[30px] h-[30px] rounded-full bg-white top-7 left-2 shadow-flat-black-adjust border-2 border-black transition-all duration-300 hover:shadow-none focus:shadow-none"
      >
        <img src={arrowIcon} alt="Icône flèche" />
      </Link>
      <div className="relative z-[3]">
        <h1 className={`font-black mb-8 text-center relative w-fit mx-auto text-xl5 leading-[50px]`}>{title}
          <span className="absolute left-0 top-0 right-0 text-purple-soft z-[-1] translate-x-0.5 translate-y-0.5">{title}</span>
          <span className="absolute left-0 top-0 right-0 text-green-soft z-[-2] translate-x-1 translate-y-1">{title}</span>
        </h1>
        <div className="px-8 mt-20">
          <div className="border border-black shadow-flat-black px-4 py-8 rounded-xl bg-white">
            <div className="mb-4">
              <p className="font-roboto text-sm text-black font-regular text-center">Ancien pseudo</p>
              <p className="font-black text-center relative w-fit mx-auto text-base">{value}
                <span className="absolute left-0 top-0 right-0 text-purple-soft z-[-1] translate-x-0.5 translate-y-0.5">{value}</span>
                <span className="absolute left-0 top-0 right-0 text-green-soft z-[-2] translate-x-1 translate-y-1">{value}</span>
              </p>
            </div>
            <form onSubmit={handleSubmit}>
              <label className="inline-block opacity-0 h-0 w-0 overflow-hidden" htmlFor={fieldName}>{fieldLabel}</label>
              <input
                id={fieldName}
                className="rounded-full border border-grey-medium px-4 py-1 w-full text-center font-roboto text-base"
                type={type}
                value=""
                placeholder={fieldLabel}
                onChange={(e) => setValue(e.target.value)}
              />
              <button type="submit" className="border block mx-auto mt-4 w-12 h-12 border-green-medium rounded-full p-2 shadow-green-medium transition-shadow duration-300 ease-out hover:shadow-none focus:shadow-none" disabled={loading}>
                <div className="relative z-[2] w-full flex flex-row justify-center text-black text-center">
                  <img src={checkedIcon} alt=""/>
                </div>
              </button>
              {error && <p>{error}</p>}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditField;