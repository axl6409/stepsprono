import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import {Link} from "react-router-dom";
import arrowIcon from "../../assets/icons/arrow-left.svg";
import checkedIcon from "../../assets/icons/checked-green.svg";
import BgUser from "../partials/user/BgUser.jsx";
import BgEmail from "../partials/user/BgEmail.jsx";
import BgPassword from "../partials/user/BgPassword.jsx";
import BgTeam from "../partials/user/BgTeam.jsx";
import BackButton from "../nav/BackButton.jsx";

const EditField = ({ title, fieldName, fieldLabel, user, token, setUser, type = "text" }) => {
  const [value, setValue] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [team, setTeam] = useState(user.team || '');
  const [teams, setTeams] = useState([]);
  const [teamLogo, setTeamLogo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

  useEffect(() => {
    if (fieldName === 'team') {
      axios.get(`${apiUrl}/api/teams`)
        .then(response => {
          console.log(response.data.data)
          setTeams(response.data.data)
        })
        .catch(error => console.error('Erreur lors de la récupération des équipes', error));
    }
  }, [fieldName, apiUrl]);

  const handleTeamChange = (event) => {
    const selectedTeam = teams.find(team => team.Team.id.toString() === event.target.value);
    setTeam(selectedTeam.Team.id);
    setTeamLogo(selectedTeam.Team.logoUrl || '');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    let updateData = {};
    switch(fieldName) {
      case 'username':
      case 'email':
        updateData[fieldName] = value;
        break;
      case 'password':
        if (newPassword !== confirmPassword) {
          setError('Les nouveaux mots de passe ne correspondent pas');
          setLoading(false);
          return;
        }
        updateData = { currentPassword, newPassword };
        break;
      case 'team':
        updateData[fieldName] = team;
        break;
      default:
        break;
    }

    try {
      const response = await axios.put(
        `${apiUrl}/api/user/update/${user.id}`,
        updateData,
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
    <div className="relative inline-block w-full h-100vh pt-20 overflow-hidden">
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
      <BackButton />
      <div className="relative z-[3]">
        <h1 className={`font-black mb-8 text-center relative w-fit mx-auto text-xl5 leading-[50px]`}>{title}
          <span className="absolute left-0 top-0 right-0 text-purple-soft z-[-1] translate-x-0.5 translate-y-0.5">{title}</span>
          <span className="absolute left-0 top-0 right-0 text-green-soft z-[-2] translate-x-1 translate-y-1">{title}</span>
        </h1>
        <div className="px-8 mt-20">
          <div className="border border-black shadow-flat-black px-4 py-8 rounded-xl bg-white">
            <div className="mb-4">
              {fieldName === 'username' ? (
                <>
                  <p className="font-roboto text-sm text-black font-regular text-center">Ancien pseudo</p>
                  <p className="font-black text-center relative w-fit mx-auto text-base">
                    <span className="relative z-[3]">{user.username}</span>
                    <span
                      className="absolute left-0 top-0 right-0 text-purple-soft z-[2] translate-x-0.5 translate-y-0.5">{user.username}</span>
                    <span
                      className="absolute left-0 top-0 right-0 text-green-soft z-[1] translate-x-1 translate-y-1">{user.username}</span>
                  </p>
                </>
              ) : fieldName === 'email' && (
                <>
                <p className="font-roboto text-sm text-black font-regular text-center">Ancien mail</p>
                <p className="font-black text-center relative w-fit mx-auto text-base">
                  <span className="relative z-[3]">{user.email}</span>
                  <span
                    className="absolute left-0 top-0 right-0 text-purple-soft z-[2] translate-x-0.5 translate-y-0.5">{user.email}</span>
                  <span
                    className="absolute left-0 top-0 right-0 text-green-soft z-[1] translate-x-1 translate-y-1">{user.email}</span>
                </p>
                </>
              )}
            </div>
            <form onSubmit={handleSubmit}>
              {fieldName === 'username' && (
                <>
                  <label className="inline-block opacity-0 h-0 w-0 overflow-hidden" htmlFor="username">{fieldLabel}</label>
                  <input
                    id="username"
                    className="rounded-full border border-grey-medium px-4 py-1 w-full text-center font-roboto text-base"
                    type="text"
                    value={value}
                    placeholder={fieldLabel}
                    onChange={(e) => setValue(e.target.value)}
                  />
                </>
              )}
              {fieldName === 'email' && (
                <>
                  <label className="inline-block opacity-0 h-0 w-0 overflow-hidden" htmlFor="email">{fieldLabel}</label>
                  <input
                    id="email"
                    className="rounded-full border border-grey-medium px-4 py-1 w-full text-center font-roboto text-base"
                    type="email"
                    value={value}
                    placeholder={fieldLabel}
                    onChange={(e) => setValue(e.target.value)}
                  />
                </>
              )}
              {fieldName === 'password' && (
                <>
                  <label className="inline-block opacity-0 h-0 w-0 overflow-hidden" htmlFor="currentPassword">Mot de passe actuel</label>
                  <input
                    id="currentPassword"
                    className="rounded-full border border-grey-medium px-4 py-1 mb-8 w-full text-center font-roboto text-sm"
                    type="password"
                    value={currentPassword}
                    placeholder="Mot de passe actuel"
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                  <label className="inline-block opacity-0 h-0 w-0 overflow-hidden" htmlFor="newPassword">Nouveau mot de passe</label>
                  <input
                    id="newPassword"
                    className="rounded-full border border-grey-medium px-4 py-1 mb-2 w-full text-center font-roboto text-sm"
                    type="password"
                    value={newPassword}
                    placeholder="Nouveau mot de passe"
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <label className="inline-block opacity-0 h-0 w-0 overflow-hidden" htmlFor="confirmPassword">Confirmer le nouveau mot de passe</label>
                  <input
                    id="confirmPassword"
                    className="rounded-full border border-grey-medium px-4 py-1 w-full text-center font-roboto text-sm"
                    type="password"
                    value={confirmPassword}
                    placeholder="Confirmer le nouveau mot de passe"
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </>
              )}
              {fieldName === 'team' && (
                <>
                  <div
                    className="w-[100px] h-[100px] mx-auto relative z-[3] bg-white overflow-hidden rounded-full border-2 border-black p-4">
                    {teamLogo ? (
                      <img
                        src={teamLogo + ".svg"}
                        alt="Logo de l'équipe"
                        className="w-auto h-auto"
                      />
                    ) : (
                      <div className="w-full h-full bg-white"></div>
                    )}
                  </div>
                  <label className="inline-block opacity-0 h-0 w-0 overflow-hidden" htmlFor="team">{fieldLabel}</label>
                  <select
                    id="team"
                    className="rounded-full border border-grey-medium px-4 py-1 my-2 w-full text-center font-roboto text-base"
                    value={team}
                    onChange={handleTeamChange}
                  >
                    <option value="">Choisis</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.Team.id}>{team.Team.name}</option>
                    ))}
                  </select>
                </>
              )}
                <button type="submit"
                        className="border block mx-auto mt-4 w-12 h-12 border-green-medium rounded-full p-2 shadow-green-medium transition-shadow duration-300 ease-out hover:shadow-none focus:shadow-none"
                        disabled={loading}>
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