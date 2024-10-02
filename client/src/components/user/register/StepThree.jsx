import React, { useState, useEffect } from 'react';
import arrowLeft from "../../../assets/icons/arrow-left.svg";
import yellowStar from "../../../assets/components/register/yellow-star.png";
import flowerPurple from "../../../assets/components/register/step-3/flower-purple.png";
import flowerRed from "../../../assets/components/register/step-3/flower-red.png";
import heartPink from "../../../assets/components/register/step-3/heart-pink.png";
import heartPinkBorder from "../../../assets/components/register/step-3/heart-pink-border.png";
import heartPurple from "../../../assets/components/register/step-3/heart-purple.png";
import heartPurpleBorder from "../../../assets/components/register/step-3/heart-purple-border.png";
import heartRed from "../../../assets/components/register/step-3/heart-red.png";
import heartWhite from "../../../assets/components/register/step-3/heart-white.png";
import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const StepThree = ({ userData, onPrevious, onFinish }) => {
  const [team, setTeam] = useState('');
  const [teams, setTeams] = useState([]);
  const [teamLogo, setTeamLogo] = useState('');

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/teams`);
        setTeams(response.data.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des équipes:', error);
      }
    };

    fetchTeams();
  }, []);

  const handleTeamChange = (event) => {
    const selectedTeam = teams.find(team => team.Team.id.toString() === event.target.value);
    setTeam(selectedTeam.teamId);
    userData.teamId = selectedTeam.Team.id;
    setTeamLogo(selectedTeam.Team.logoUrl || '');
  };

  const isFormValid = () => {
    return userData.email && userData.password && userData.username;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onFinish({ teamId: team });
  }

  return (
    <div
      className="step-three-container h-full relative z-[2] bg-cover bg-no-repeat bg-bottom flex flex-col justify-start py-8 px-8">
      <h2
        className={`
        text-center
            font-black 
            font-rubik 
            my-8 
            mt-0 
            relative 
            w-fit 
            mx-auto 
            text-xl6
            leading-[60px]
            `}>
        <span className="relative z-[3]">Complète ton profil</span>
        <span className="absolute inset-0 translate-x-1 translate-y-1 text-purple-soft z-[2]">Complète ton profil</span>
        <span className="absolute inset-0 translate-x-2 translate-y-2 text-green-soft z-[1]">Complète ton profil</span>
      </h2>
      <div
        className="block relative border-2 border-black w-full mx-auto bg-white rounded-xl py-12 overflow-hidden">
        <img src={flowerRed} alt="" className="absolute right-1 -top-1 z-[10]"/>
        <div className="absolute left-2 top-2 z-[30]">
          <button
            className="relative block w-fit rounded-full mt-2 ml-2 before:content-[''] before:absolute before:z-[1] before:w-[30px] before:h-[30px] before:inset-0 before:rounded-full before:bg-black before:border-black before:border group"
            onClick={onPrevious}>
            <img
              className="relative z-[2] w-[30px] h-[30px] block border-2 border-black text-black uppercase font-regular text-l font-roboto px-1 py-1 rounded-full text-center shadow-md bg-white transition -translate-y-0.5 group-hover:-translate-y-0"
              src={arrowLeft} alt="Retour"/>
          </button>
        </div>
        <div className="relative w-fit mx-auto mt-4 z-[29]">
          <img src={heartPurple} alt="" className="absolute left-0 -top-2 z-[1]"/>
          <img src={heartRed} alt="" className="absolute left-2 top-0 z-[2]"/>
          <p className="relative z-[4] font-rubik text-center font-black leading-6 text-xl2">Quelle est ton <br/> équipe
            de coeur ?</p>
        </div>
        <form
          className="flex flex-col items-center px-8 py-8 relative z-[29]"
          onSubmit={(e) => {
            e.preventDefault();
            onFinish(team);
          }}>
          <div className="relative">
            <img src={heartPurpleBorder} alt="" className="absolute z-[1] -top-2 -right-2"/>
            <img src={heartWhite} alt="" className="absolute z-[2] top-2 -right-2"/>
            <img src={heartRed} alt="" className="absolute z-[4] top-4 right-1"/>
            <div
              className="w-[150px] h-[150px] relative z-[3] bg-white overflow-hidden rounded-full border-2 border-black p-4">
              {teamLogo ? (
                <img src={teamLogo + ".svg"} alt="Logo de l'équipe" className="w-auto h-auto"/>
              ) : (
                <div className="w-full h-full bg-white"></div>
              )}
            </div>
            <img src={heartPink} alt="" className="absolute z-[5] bottom-2 left-1"/>
            <img src={heartRed} alt="" className="absolute z-[6] bottom-1 left-4"/>
          </div>
          <select className="p-1 border border-black rounded-md font-rubik underline mt-6" onChange={handleTeamChange}
                  value={team}>
            <option value="">Choisis</option>
            {teams.map((team) => (
              <option key={team.id} value={team.Team.id}>{team.Team.name}</option>
            ))}
          </select>
        </form>
        <img src={heartPink} alt="" className="absolute z-[6] w-[50px] -left-4 bottom-1/2"/>
        <img src={flowerPurple} alt="" className="absolute z-[6] -left-6 bottom-4"/>
        <img src={heartWhite} alt="" className="absolute z-[6] left-2 bottom-4"/>
        <img src={heartPink} alt="" className="absolute z-[6] -right-2 bottom-12"/>
      </div>
      <button
        type="submit"
        className="w-4/5 relative mt-8 mx-auto before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-black before:border-black before:border group"
        onClick={handleSubmit}
        {...(!isFormValid() && { disabled: true })}
      >
        <span
          className="relative z-[2] w-full block border border-black text-black uppercase font-regular text-l font-roboto px-3 py-2 rounded-full text-center shadow-md bg-grey-light transition -translate-y-1.5 group-hover:-translate-y-0">Inscription</span>
      </button>
    </div>
  );
};

export default StepThree;
