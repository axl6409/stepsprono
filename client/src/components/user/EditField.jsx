import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from "react-router-dom";
import arrowIcon from "../../assets/icons/arrow-left.svg";
import checkedIcon from "../../assets/icons/checked-green.svg";
import BgUser from "./BgUser.jsx";
import BgEmail from "./BgEmail.jsx";
import BgPassword from "./BgPassword.jsx";
import BgTeam from "./BgTeam.jsx";
import BackButton from "../nav/BackButton.jsx";
import AlertModal from "../modals/AlertModal.jsx";
import SimpleTitle from "../partials/SimpleTitle.jsx";

const EditField = ({ title, fieldName, fieldLabel, user, token, setUser, type = "text" }) => {
  const history = useNavigate();
  const [value, setValue] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [team, setTeam] = useState(user.teamId || '');
  const [teams, setTeams] = useState([]);
  const [teamLogo, setTeamLogo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('');
  const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

  useEffect(() => {
    if (fieldName === 'team') {
      axios.get(`${apiUrl}/api/teams`)
        .then(response => {
          setTeams(response.data.data)
          const selectedTeam = response.data.data.find(team => team.team_id.toString() === user.team_id.toString());
          if (selectedTeam && selectedTeam.Team) {
            setTeamLogo(selectedTeam.Team.logo_url || "");
            setTeam(selectedTeam.Team.id.toString());
          }
        })
        .catch(error => console.error('Erreur lors de la récupération des équipes', error));
    }
  }, [fieldName, apiUrl, user.teamId]);

  const handleTeamChange = (event) => {
    const selectedTeamId = event.target.value;
    const selectedTeam = teams.find(team => team.Team.id.toString() === selectedTeamId);
    setTeam(selectedTeamId);

    if (selectedTeam && selectedTeam.Team.logo_url) {
      setTeamLogo(selectedTeam.Team.logo_url);
    } else {
      setTeamLogo('');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    let updateData = {};

    const verifyCurrentPassword = async () => {
      try {
        const response = await axios.post(`${apiUrl}/api/user/verify-password`, {
          userId: user.id,
          currentPassword
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        return response.status === 200;
      } catch (error) {
        handleError('Mot de passe actuel incorrect', 3000);
        return false;
      }
    };
    switch(fieldName) {
      case 'username':
      case 'email':
        updateData[fieldName] = value;
        break;
      case 'password':
        if (newPassword !== confirmPassword) {
          handleError('Les nouveaux mots de passe ne correspondent pas', 3000);
          setLoading(false);
          return;
        }
        const isCurrentPasswordValid = await verifyCurrentPassword();
        if (!isCurrentPasswordValid) {
          handleError('Le mot de passe actuel est incorrect', 3000);
          setLoading(false);
          return;
        }
        updateData = { currentPassword, password: newPassword };
        break;
      case 'team':
        updateData['team_id'] = team;
        break;
      default:
        break;
    }

    try {
      const response = await axios.put(`${apiUrl}/api/user/update/${user.id}`,
        updateData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        }
      );
      setUser(response.data);
      setTeam(response.data.team_id || team);
      setLoading(false);
      handleSuccess('Mise à jour effectuée', 2000);
    } catch (error) {
      setLoading(false);
      handleError('Erreur lors de la mise à jour', 2000);
    }
  };

  const handleSuccess = (message, timeout) => {
    setAlertMessage(message);
    setAlertType('success');
    setTimeout(() => {
      setAlertMessage('');
    }, timeout);
  };

  const handleError = (message, timeout) => {
    setAlertMessage(message);
    setAlertType('error');
    setTimeout(() => {
      setAlertMessage('')
    }, timeout);
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
        <AlertModal message={alertMessage} type={alertType} />
        <SimpleTitle title={title} />
        <div className="px-8 mt-12">
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
                    className="w-[100px] h-[100px] mx-auto relative z-[3] bg-white overflow-hidden rounded-full border-2 border-black p-0 flex flex-col justify-center">
                    {teamLogo ? (
                      <img
                        src={apiUrl + "/uploads/teams/" + team + "/" + teamLogo}
                        alt="Logo de l'équipe"
                        className="w-auto h-[90%] mx-auto object-cover"
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
