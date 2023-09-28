import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {useCookies} from "react-cookie";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCaretLeft, faCircleXmark, faPen} from "@fortawesome/free-solid-svg-icons";
import {useForm} from "react-hook-form";
import {Link} from "react-router-dom";

const EditTeams = ({ team, mode, onSubmit }) => {
  const [cookies] = useCookies(['token']);
  const token = localStorage.getItem('token') || cookies.token
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm();
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [leagues, setLeagues] = useState([])

  useEffect(() => {
    if (mode === 'edit' && team) {
      setValue('name', team.name || '')
      setValue('slug', team.slug || '')
      setValue('logo', team.logoUrl || '')
    }
  }, [mode, team, setValue])

  useEffect(() => { // 2. Utilisez `useEffect` pour récupérer les ligues
    const fetchLeagues = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/leagues', {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        setLeagues(response.data);
      } catch (error) {
        console.error('Une erreur s\'est produite lors de la récupération des ligues', error);
      }
    };
    fetchLeagues();
  }, [token]);

  const onFormSubmit = async (data) => {
    setErrorMessage('')
    setSuccessMessage('')
    try {
      data.slug = data.name.toLowerCase().replace(/\s+/g, '_')
      if (!data.name || !data.logoUrl) {
        setErrorMessage('Veuillez remplir tout les champs')
        return;
      }
      const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/
      if (!urlRegex.test(data.logoUrl)) {
        setErrorMessage('Veuillez entrer une URL valide pour le logo')
        return
      }

      const url = mode === 'edit'
        ? `http://localhost:3001/api/admin/teams/edit/${team.id}`
        : 'http://localhost:3001/api/admin/teams/add';
      const method = mode === 'edit' ? 'put' : 'post';

      if (onSubmit) {
        await onSubmit(data);
      } else {
        await axios({ method, url, data });
        setSuccessMessage('Équipe ajoutée !');
        setTimeout(() => setSuccessMessage(''), 2000);
        reset();
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        setErrorMessage(error.response.data.error);
      } else {
        setErrorMessage('Une erreur inattendue s’est produite');
      }
    }
  };

  return (
    <div className="px-6 py-4 relative">
      <Link
        to="/admin/teams"
        className="w-fit block relative my-4 before:content-[''] before:inline-block before:absolute before:z-[-1] before:inset-0 before:bg-green-lime before:border-black before:border-2 group"
      >
        <span className="relative z-[2] w-full block border-2 border-black text-black px-3 py-1 text-center shadow-md bg-white transition -translate-y-1 translate-x-1 group-hover:-translate-y-0 group-hover:-translate-x-0"><FontAwesomeIcon icon={faCaretLeft} /></span>
      </Link>
      <h2 className="w-fit px-2.5 py-0.5 bg-white absolute z-[5] border-r-2 border-b-2 border-black rounded-br-xl font-title text-l uppercase font-bold">{mode === 'edit' ? 'Éditer l’équipe' : 'Ajouter une équipe'}</h2>
      <form
        className="flex flex-col justify-start border-2 border-black px-4 pt-16 pb-8 relative z-[4] bg-electric-blue shadow-flat-black"
        onSubmit={handleSubmit(onFormSubmit)}>
        {errorMessage && <p className="border-2 border-black text-white px-3.5 py-2.5 font-sans text-sm font-bold bg-light-red shadow-flat-black">{errorMessage}</p>}
        {successMessage && <p className="border-2 border-black text-white px-3.5 py-2.5 font-sans text-sm font-bold bg-electric-blue shadow-flat-black">{successMessage}</p>}
        <div className="flex flex-col my-8 group">
          <label
            htmlFor="name"
            className="relative z-[3] font-sans font-bold text-sm py-1 px-2 w-fit bg-white border-t-2 border-r-2 border-l-2 border-t-black border-r-black border-l-black bottom-[-2px]">Nom de l'équipe</label>
          <input
            type="text"
            id="name"
            placeholder="Nom de l'équipe"
            className="relative z-[2] px-2 py-1.5 w-full border-2 border-black font-sans font-regular text-sm transition duration-300 focus:outline-none focus:shadow-flat-black group-hover:shadow-flat-black"
            {...register('name', { required: 'Veuillez entrer un nom d\'équipe' })}
          />
          {errors.name && <span>{errors.name.message}</span>}
        </div>

        <div className="flex flex-col my-8 group">
          <label
            htmlFor="logoUrl"
            className="relative z-[3] font-sans font-bold text-sm py-1 px-2 w-fit bg-white border-t-2 border-r-2 border-l-2 border-t-black border-r-black border-l-black bottom-[-2px]"
          >URL du logo</label>
          <input
            type="text"
            id="logoUrl"
            placeholder="Url du logo du club"
            className="relative z-[2] px-2 py-1.5 w-full border-2 border-black font-sans font-regular text-sm transition duration-300 focus:outline-none focus:shadow-flat-black group-hover:shadow-flat-black"
            {...register('logoUrl', { required: 'Veuillez entrer une URL' })}
          />
          {errors.logoUrl && <span>{errors.logoUrl.message}</span>}
        </div>

        <div className="flex flex-col my-8 group">
          <label
            htmlFor="leagueId"
            className="relative z-[3] font-sans font-bold text-sm py-1 px-2 w-fit bg-white border-t-2 border-r-2 border-l-2 border-t-black border-r-black border-l-black bottom-[-2px]">League</label>
          <select id="leagueId" className="relative z-[2] px-2 py-1.5 w-full border-2 border-black font-sans font-regular text-sm transition duration-300 focus:outline-none focus:shadow-flat-black group-hover:shadow-flat-black" {...register('leagueId', { required: 'Veuillez sélectionner une league' })}>
            {leagues.map((league) => (
              <option key={league.id} value={league.id}>
                {league.name}
              </option>
            ))}
          </select>
          {errors.leagueId && <span>{errors.leagueId.message}</span>}
        </div>

        <button
          type="submit"
          className="w-3/5 relative my-4 mx-auto outline-none before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-bright-yellow before:border-black before:border-2 group">
          <span className="relative z-[2] w-full block border-2 border-black text-black px-3 py-2 rounded-full text-center shadow-md bg-white transition -translate-y-2.5 group-hover:-translate-y-0 group-focus:-translate-y-0">{mode === 'edit' ? 'Mettre à jour l’équipe' : 'Ajouter l’équipe'}</span>
        </button>
      </form>
    </div>
  );
}

export default EditTeams;
