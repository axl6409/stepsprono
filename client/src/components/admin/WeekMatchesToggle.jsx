import React, { useState, useEffect } from 'react';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const WeekMatchesToggle = ({ token }) => {
  const [weekMatches, setWeekMatches] = useState([]);

  useEffect(() => {
    const fetchWeekMatches = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/matchs/current-week`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setWeekMatches(response.data.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des matchs de la semaine :', error);
      }
    };

    fetchWeekMatches();
  }, [token]);

  const handleToggleRequireDetails = async (matchId, require_details) => {
    try {
      const response = await axios.patch(
        `${apiUrl}/api/admin/matchs/${matchId}/require-details`,
        { require_details },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 200) {
        setWeekMatches((prevMatches) =>
          prevMatches.map((match) =>
            match.id === matchId ? { ...match, require_details } : match
          )
        );
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du champ requireDetails :', error);
    }
  };

  return (
    <div>
      <ul>
        {weekMatches.map((match) => (
          <li
            className="relative flex flex-col justify-between border-2 border-black bg-white rounded-xl py-1 px-4 pt-4 h-fit shadow-flat-black my-4 shadow-flat-purple"
            key={match.id}>
            <p
              className="username absolute font-title font-bold bg-deep-red text-white text-sm leading-5 -top-3.5 left-2.5 py-0.5 px-1.5 rounded-full border border-black shadow-flat-black">{match.id}</p>
            <div className="flex flex-row justify-between">
              {/*<p className="name font-sans text-sm font-bold capitalize">{match.utc_date.format('DD MMMM YYYY')}</p>*/}
              {/*<p className="name font-sans text-sm font-bold capitalize flex flex-row justify-center">*/}
              {/*  <span*/}
              {/*    className="inline-block bg-white shadow-flat-black text-black px-1 pb-0.5 font-title leading-4 font-medium text-sm mx-0.5 border-2 border-black">{match.utc_date.format('HH')}</span>*/}
              {/*  <span*/}
              {/*    className="inline-block bg-white shadow-flat-black text-black px-1 pb-0.5 font-title leading-4 font-medium text-sm mx-0.5 border-2 border-black">{match.utc_date.format('mm')}</span>*/}
              {/*  <span*/}
              {/*    className="inline-block bg-white shadow-flat-black text-black px-1 pb-0.5 font-title leading-4 font-medium text-sm mx-0.5 border-2 border-black">{match.utc_date.format('ss')}</span>*/}
              {/*</p>*/}
            </div>
            <div className="flex flex-row justify-between mb-2">
              <div className="flex flex-row justify-between">
                <img className="inline-block h-12 w-auto my-auto"
                     src={apiUrl + "/uploads/teams/" + match.HomeTeam.id + "/" + match.HomeTeam.logo_url}
                     alt={match.HomeTeam.name}/>
                <span className="font-sans font-bold text-center block my-auto"> - </span>
                <img className="inline-block h-12 w-auto my-auto"
                     src={apiUrl + "/uploads/teams/" + match.AwayTeam.id + "/" + match.AwayTeam.logo_url}
                     alt={match.AwayTeam.name}/>
              </div>
              <button
                className={`w-14 h-7 flex items-center rounded-full border-2 border-black mx-3 px-1 shadow-flat-black-adjust focus:outline-none ${match.require_details ? 'bg-green-lime-deep' : 'bg-white'}`}
                onClick={() => handleToggleRequireDetails(match.id, !match.require_details)}
              >
                <div
                  className={`bg-white w-5 h-5 rounded-full border-2 border-black shadow-md transform ${match.require_details ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WeekMatchesToggle;
