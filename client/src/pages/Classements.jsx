import React from 'react';
import {Link} from "react-router-dom";


const Classements = () => {
  return (
    <div className="text-center p-10 h-70vh flex flex-col justify-center">
      <h1 className="text-3xl font-bold mb-4">Classements</h1>
      <div className="relative border-t-2 border-b-2 border-black overflow-hidden py-8 px-2 pt-0 bg-flat-yellow">
        <div className="section-head relative">
          <ul className={`overflow-hidden bg-white w-fit min-w-[200px] py-1.5 pb-0 relative -top-1.5 border-2 border-black rounded-br-md rounded-bl-md shadow-flat-black transition duration-300`}>
            <li className="pb-1">
              <button className="focus:outline-none px-1.5 w-full">
                <span className="mr-1">Ligue 1</span>
              </button>
            </li>
            <li>
              <button>Ligue 2</button>
            </li>
          </ul>
        </div>
        <div className="flex flex-col justify-start">
          <ul>

          </ul>
        </div>
      </div>
    </div>
  );
}

export default Classements;
