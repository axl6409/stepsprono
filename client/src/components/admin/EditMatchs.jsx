import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useCookies } from "react-cookie";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretLeft, faCircleXmark, faPen } from "@fortawesome/free-solid-svg-icons";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";


const EditMatchs = ({ match, mode, onSubmit, onChange }) => {
  const [cookies] = useCookies(['token']);
  const token = localStorage.getItem('token') || cookies.token
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm();
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [teams, setTeams] = useState([]);
  const [selectedHomeTeam, setSelectedHomeTeam] = useState(null);
  const [selectedAwayTeam, setSelectedAwayTeam] = useState(null);

  useEffect(() => {
    if (mode === 'edit' && match) {
      setValue('homeTeam', match.homeTeam || '')
      setSelectedHomeTeam(match.homeTeam);
      setValue('awayTeam', match.awayTeam || '')
      setValue('date', match.date || '')
    }
  }, [mode, match, setValue]);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/teams', {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        setTeams(response.data.data);
      } catch (error) {
        console.error('Une erreur s\'est produite lors de la récupération des équipes', error);
      }
    };
    fetchTeams();
  }, [token]);

  const onFormSubmit = async (data) => {
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const url = mode === 'edit'
        ? `http://localhost:3001/api/admin/matchs/edit/${match.id}`
        : 'http://localhost:3001/api/admin/matchs/add';
      const method = mode === 'edit' ? 'put' : 'post';

      if (onSubmit) {
        await onSubmit(data);
      } else {
        await axios({ method, url, data });
        setSuccessMessage('Match créé !');
        setTimeout(() => setSuccessMessage(''), 2000);
        reset();
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        setErrorMessage(error.response.data.error);
      } else {
        setErrorMessage('Une erreur est arrivée: ' + error);
      }
    }
  };
  const handleHomeTeamChange = (e) => {
    setSelectedHomeTeam(Number(e.target.value));
    setSelectedAwayTeam(null);
  };
  const handleAwayTeamChange = (e) => {
    setSelectedAwayTeam(Number(e.target.value));
    setSelectedHomeTeam(null);
  };

  return (
    <div className="px-6 py-4 relative">
      <Link
        to="/matchs"
        className="w-fit block relative my-4 before:content-[''] before:inline-block before:absolute before:z-[-1] before:inset-0 before:bg-green-lime before:border-black before:border-2 group"
      >
        <span className="relative z-[2] w-full block border-2 border-black text-black px-3 py-1 text-center shadow-md bg-white transition -translate-y-1 translate-x-1 group-hover:-translate-y-0 group-hover:-translate-x-0"><FontAwesomeIcon icon={faCaretLeft} /></span>
      </Link>
      <h2 className="w-fit px-2.5 py-0.5 bg-white absolute z-[5] border-r-2 border-b-2 border-black rounded-br-xl font-title text-l uppercase font-bold">{mode === 'edit' ? 'Éditer le match' : 'Ajouter un match'}</h2>
      <form
        className="flex flex-col justify-start border-2 border-black px-4 pt-16 pb-8 relative z-[4] bg-electric-blue shadow-flat-black"
        onSubmit={handleSubmit(onFormSubmit)}>
        {errorMessage && <p className="border-2 border-black text-white px-3.5 py-2.5 font-sans text-sm font-bold bg-light-red shadow-flat-black">{errorMessage}</p>}
        {successMessage && <p className="border-2 border-black text-white px-3.5 py-2.5 font-sans text-sm font-bold bg-electric-blue shadow-flat-black">{successMessage}</p>}
        <div className="flex flex-col my-4 group">
          <label
            htmlFor="homeTeam"
            className="relative z-[3] font-sans font-bold text-sm py-1 px-2 w-fit bg-white border-t-2 border-r-2 border-l-2 border-t-black border-r-black border-l-black bottom-[-2px]">Home Team</label>
          <select
            id="homeTeam"
            className="relative z-[2] px-2 py-1.5 w-full border-2 border-black font-sans font-regular text-sm transition duration-300 focus:outline-none focus:shadow-flat-black group-hover:shadow-flat-black"
            {...register('homeTeam', {
              onChange: (e) => handleHomeTeamChange(e),
            })}>
            <option value="">Sélectionnez une équipe</option>
            {teams
              .filter(team => team.id !== selectedAwayTeam)
              .map(team => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
          </select>
        </div>
        <div className="flex flex-col my-4 group">
          <label
            htmlFor="awayTeam"
            className="relative z-[3] font-sans font-bold text-sm py-1 px-2 w-fit bg-white border-t-2 border-r-2 border-l-2 border-t-black border-r-black border-l-black bottom-[-2px]">Away Team</label>
          <select
            id="awayTeam"
            className="relative z-[2] px-2 py-1.5 w-full border-2 border-black font-sans font-regular text-sm transition duration-300 focus:outline-none focus:shadow-flat-black group-hover:shadow-flat-black"
            {...register('awayTeam', {
              onChange: (e) => handleAwayTeamChange(e),
            })}>
            <option value="">Sélectionnez une équipe</option>
            {teams
              .filter(team => team.id !== selectedHomeTeam)
              .map(team => (
                <option key={team.id} value={team.id} style={{ backgroundImage: team.logoUrl ? `url(${team.logoUrl})` : 'none' }}>
                  {team.name}
                </option>
              ))}
          </select>
        </div>
        <div className="flex flex-col my-4 group">
          <label
            htmlFor="date"
            className="relative z-[3] font-sans font-bold text-sm py-1 px-2 w-fit bg-white border-t-2 border-r-2 border-l-2 border-t-black border-r-black border-l-black bottom-[-2px]">Date</label>
          <input
            id="date"
            className="relative z-[2] px-2 py-1.5 w-full border-2 border-black font-sans font-regular text-sm transition duration-300 focus:outline-none focus:shadow-flat-black group-hover:shadow-flat-black"
            type="datetime-local" {...register('date')} />
        </div>
        <button
          type="submit"
          className="w-3/5 relative my-4 mx-auto outline-none before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-bright-yellow before:border-black before:border-2 group">
          <span className="relative z-[2] w-full block border-2 border-black text-black px-3 py-2 rounded-full text-center shadow-md bg-white transition -translate-y-2.5 group-hover:-translate-y-0 group-focus:-translate-y-0">{mode === 'edit' ? 'Mettre à jour le match' : 'Ajouter le match'}</span>
        </button>
      </form>
    </div>
  );
}

export default EditMatchs;
