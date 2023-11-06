import React, {useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCaretLeft, faCheck, faPaperPlane, faReceipt, faXmark} from "@fortawesome/free-solid-svg-icons";
import moment from "moment";
import { useForm } from 'react-hook-form';
import axios from "axios";

const Pronostic = ({ match, userId, lastMatch, closeModal, isModalOpen, token }) => {
  const { handleSubmit, register } = useForm();
  const [selectedTeam, setSelectedTeam] = useState(null);

  const onSubmit = async (data) => {
    console.log(data)
    try {
      const response = await axios.post('http://127.0.0.1:3001/api/bet/add', {
        userId: userId,
        matchId: match.id,
        winnerId: parseInt(data.team),
        homeScore: data.homeScore,
        awayScore: data.awayScore,
        playerGoal: data.scorer,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok) {
        console.log("Pari enregistré avec succès:", result);
      } else {
        console.error("Erreur lors de l'enregistrement du pari:", result.error);
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du pari:", error);
    }
  };

  return (
    <div className={`modal fixed top-20 left-0 right-0 bottom-0 z-[40] w-full pt-20 pb-8 border-b-2 border-t-2 transition-all duration-300 border-black bg-electric-blue transform ${isModalOpen ? 'translate-y-0' : 'translate-y-[-150%]'}`}>
      <button
        className="absolute top-4 right-4 before:content-[''] before:inline-block before:absolute before:z-[-1] before:inset-0 before:rounded-md before:bg-flat-red before:border-black before:border-2 group"
        onClick={() => closeModal()}
      >
        <span className="relative z-[2] w-full flex flex-col justify-center border-2 border-black text-black px-2 py-1.5 rounded-md text-center shadow-md bg-white transition -translate-y-1 -translate-x-1 group-hover:-translate-y-0 group-hover:-translate-x-0">
          <FontAwesomeIcon icon={faXmark} className="h-[30px]"/>
        </span>
      </button>
      <div className="modal-content my-auto block w-[95%] mx-auto bg-white">
        <div className="py-4 px-6 mx-auto border-2 border-black w-full shadow-flat-black">
          <p className="text-sans uppercase text-black font-bold text-l mb-4">Sélectionner une équipe</p>
          {match && (
            <form
              className="prono-form flex flex-col justify-center w-full h-auto"
              onSubmit={handleSubmit(onSubmit)}>
              <div className="flex flex-row justify-evenly mb-4">
                <label className={`label-element relative w-[80px] h-[80px] cursor-pointer ${selectedTeam === match.HomeTeam.id ? 'checked' : ''}`}>
                  <input
                    type="radio"
                    value={match.HomeTeam.id}
                    className="hidden"
                    {...register("team")}
                    onChange={() => setSelectedTeam(match.HomeTeam.id)}
                  />
                  <div className="border-2 border-black relative z-[2] bg-white h-full p-2.5 px-auto">
                    <img className="mx-auto h-full" src={match.HomeTeam.logoUrl} alt={`${match.HomeTeam.name} Logo`} />
                  </div>
                </label>
                <label className={`label-element relative w-[80px] h-[80px] cursor-pointer ${selectedTeam === "null" ? 'checked' : ''}`}>
                  <input
                    type="radio"
                    value="null"
                    className="hidden"
                    {...register("team")}
                    onChange={() => setSelectedTeam("null")}
                  />
                  <div className="w-full h-full flex flex-col justify-center border-2 border-black bg-white relative z-[2]">
                    <p className="font-sans uppercase text-black font-medium text-sm">null</p>
                  </div>
                </label>
                <label className={`label-element relative w-[80px] h-[80px] cursor-pointer ${selectedTeam === match.AwayTeam.id ? 'checked' : ''}`}>
                  <input
                    type="radio"
                    value={match.AwayTeam.id}
                    className="hidden"
                    {...register("team")}
                    onChange={() => setSelectedTeam(match.AwayTeam.id)}
                  />
                  <div className="border-2 border-black relative z-[2] bg-white h-full p-2.5 px-auto">
                    <img className="mx-auto h-full" src={match.AwayTeam.logoUrl} alt={`${match.AwayTeam.name} Logo`} />
                  </div>
                </label>
              </div>
              {match && match.id === lastMatch.id && (
                <>
                  <div className="flex flex-row justify-evenly my-4">
                    <label className="flex flex-col w-2/5">
                      <span className="font-sans uppercase text-black font-medium text-sm">Score</span>
                      <span className="font-sans text-black font-medium text-sm">{match.HomeTeam.name}</span>
                      <input className="border-2 border-black text-sans font-medium text-base text-center shadow-flat-black" type="number" {...register("homeScore")} />
                    </label>
                    <label className="flex flex-col w-2/5">
                      <span className="font-sans uppercase text-black font-medium text-sm">Score</span>
                      <span className="font-sans text-black font-medium text-sm">{match.AwayTeam.name}</span>
                      <input className="border-2 border-black text-sans font-medium text-base text-center shadow-flat-black" type="number" {...register("awayScore")} />
                    </label>
                  </div>
                  <div className="flex flex-row justify-evenly my-4">
                    <label className="flex flex-col w-4/5 mx-auto text-center">
                      <span className="font-sans uppercase text-black font-medium text-sm">Buteur:</span>
                      <input className="border-2 border-black text-sans font-medium text-base text-center shadow-flat-black" type="text" {...register("scorer")} />
                    </label>
                  </div>
                </>
              )}
              <button
                className="relative mt-8 mx-auto block h-fit before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-md before:bg-green-lime before:border-black before:border-2 group"
                type="submit"
                onClick={() => { closeModal() }}
              >
                <span className="relative z-[2] w-full flex flex-row justify-center border-2 border-black text-black px-4 py-1.5 rounded-md text-center font-sans uppercase font-bold shadow-md bg-white transition -translate-y-1 -translate-x-1 group-hover:-translate-y-0 group-hover:-translate-x-0">
                  Envoyer
                  <FontAwesomeIcon icon={faPaperPlane} className="ml-4" />
                </span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Pronostic