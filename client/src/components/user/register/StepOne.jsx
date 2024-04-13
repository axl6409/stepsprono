import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import arrowLeft from "../../../assets/icons/arrow-left.svg";
import background from "../../../assets/components/background-hexagon-large.png";
import userIcon from "../../../assets/icons/email.svg";
import lockIcon from "../../../assets/icons/password-yellow.svg";

const StepOne = ({ onNext }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <>
      <div
        className="step-one-container h-[90%] relative z-[2] bg-cover bg-no-repeat bg-bottom flex flex-col justify-start py-16 px-4"
        style={{backgroundImage: `url(${background})`}}>
        <div
          className="block relative border-2 border-black w-full mx-auto bg-white rounded-xl">
          <Link
            to="/"
            className="relative block w-fit rounded-full mt-2 ml-2 before:content-[''] before:absolute before:z-[1] before:w-[30px] before:h-[30px] before:inset-0 before:rounded-full before:bg-black before:border-black before:border group"
          >
            <img
              className="relative z-[2] w-[30px] h-[30px] block border-2 border-black text-black uppercase font-regular text-l font-roboto px-1 py-1 rounded-full text-center shadow-md bg-white transition -translate-y-0.5 group-hover:-translate-y-0"
              src={arrowLeft} alt="Retour"/>
          </Link>
          <h2
            className={`
            font-black 
            font-rubik 
            my-8 
            mt-0 
            capitalize 
            relative 
            w-fit 
            mx-auto 
            text-xl6
            before:content-['Welcome!']
            before:absolute
            before:inset-0
            before:z-[2]
            before:translate-x-1
            before:translate-y-1
            before:text-xl6
            before:text-purple-soft
            after:content-['Welcome!']
            after:absolute
            after:inset-0
            after:z-[1]
            after:translate-x-2
            after:translate-y-2
            after:text-xl6
            after:text-green-soft
            `}>
            <span className="relative z-[3]">Welcome!</span>
          </h2>
          <p className="font-rubik text-black font-black w-2/3 leading-6 mx-auto text-xl text-center">Tout
            d'abord,<br/> il faut:</p>
          <form
            className="flex flex-col items-center px-8 pb-8"
            onSubmit={(e) => {
              e.preventDefault();
              onNext(email, password);
            }}>
            <label htmlFor="username" className="my-4 w-full relative flex flex-row justify-start">
              <div className="w-[20%] absolute -top-10 -right-6 -rotate-2 flex flex-col justify-center">
                <img src={userIcon} alt="icone de l'utilisateur"/>
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="p-3 w-full bg-white border border-black rounded-full text-center font-roboto text-base font-regular focus:outline-none placeholder:text-grey-soft"
                required
              />
            </label>
            <label htmlFor="password" className="my-4 w-full relative flex flex-row justify-start">
              <div className="w-[20%] absolute -bottom-4 -left-8 -rotate-2 flex flex-col justify-center">
                <img src={lockIcon} alt="icone de l'utilisateur"/>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mot de passe"
                className="p-3 w-full bg-white border border-black rounded-full text-center font-roboto text-base font-regular focus:outline-none placeholder:text-grey-soft"
                required
              />
            </label>
            <button
              className="relative block w-fit rounded-full mt-8 ml-2 before:content-[''] before:absolute before:z-[1] before:w-[40px] before:h-[40px] before:inset-0 before:rounded-full before:bg-black before:border-black before:border group"
              type="submit">
              <img
                className="relative z-[2] w-[40px] h-[40px] rotate-180 block border-2 border-black text-black uppercase font-regular text-l font-roboto px-2 py-2 rounded-full text-center shadow-md bg-green-medium transition -translate-y-0.5 group-hover:-translate-y-0"
                src={arrowLeft} alt="Suivant"/>
            </button>
          </form>
        </div>
      </div>
      <div className="p-8 h-[30%] bg-purple-light relative z-[1] mt-[-17%] flex flex-col justify-center">
      </div>
    </>
  );
};

export default StepOne;
