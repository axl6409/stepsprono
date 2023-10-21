import React, {useEffect, useState} from "react";
import axios from "axios";
import {Link} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPen} from "@fortawesome/free-solid-svg-icons";
import moment from "moment";
import 'moment/locale/fr'

const NextWeekend = ({token}) => {
  moment.locale('fr')
  console.log(moment.locale())
  const [matchs, setMatchs] = useState([])
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMatchs = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://127.0.0.1:3001/api/matchs/next-weekend', {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        setMatchs(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors de la récupération des matchs :', error);
        setError(error);
        setLoading(false);
      }
    }
    fetchMatchs()
  }, [token])

  if (loading) return <p>Chargement...</p>;
  if (error) return <p>Erreur : {error.message}</p>;

  return (
    <div className="relative pt-12 border-2 border-black overflow-hidden py-8 px-2 bg-flat-yellow shadow-flat-black">
      <div>
        <ul className="flex flex-col justify-start">
          {matchs.map(match => (
            <li className="flex flex-row p-1.5 my-2 border-2 border-black rounded-l bg-white shadow-flat-black" key={match.id}>
              <div className="w-1/5 flex flex-col justify-center">
                <img src={match.HomeTeam.logoUrl} alt={`${match.HomeTeam.name} Logo`} className="team-logo w-1/2 mx-auto"/>
                <p>{match.HomeTeam.shortName}</p>
              </div>
              <div className="w-1/5 flex flex-col justify-center">
                <img src={match.AwayTeam.logoUrl} alt={`${match.AwayTeam.name} Logo`} className="team-logo w-1/2 mx-auto"/>
                <p>{match.AwayTeam.shortName}</p>
              </div>
              <div className="w-3/5 text-center flex flex-col justify-center px-6 py-2">
                <p className="name font-sans text-base font-medium">{moment(match.utcDate).format('dddd M')}</p>
              </div>
              <Link to={`/pronostic/${match.id}`} className="w-1/5 flex flex-col justify-center">
                <FontAwesomeIcon icon={faPen} className="inline-block align-[-4px]" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default NextWeekend