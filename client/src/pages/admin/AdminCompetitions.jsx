import React, {useContext, useEffect, useState} from 'react';
import {useCookies} from "react-cookie";
import {Link} from "react-router-dom";
import axios from "axios";
import arrowIcon from "../../assets/icons/arrow-left.svg";
import downloadIcon from "../../assets/icons/download-icon.svg";
import SimpleTitle from "../../components/partials/SimpleTitle.jsx";
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const AdminCompetitions = () => {
  const [cookies] = useCookies(['token']);
  const token = localStorage.getItem('token') || cookies.token
  const [competitions, setCompetitions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [updateStatus, setUpdateStatus] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/competitions`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        const competitionsData = response.data;
        setCompetitions(competitionsData);
        setIsLoading(false);
      } catch (error) {
        console.error('Erreur lors de la récupération des équipes :', error);
        setError(error);
        setIsLoading(false);
      }
    };

    fetchCompetitions()
  }, [token]);

    const handleUpdateCompetitionTeamsNewSeason = async (competitionId) => {
        try {
            const response = await axios.post(`${apiUrl}/api/admin/competition/update-teams-new-season`, {
                competitionId,
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.status === 200) {
                setUpdateStatus(true);
                setUpdateMessage('Équipes mises à jour pour la nouvelle saison !');
                setIsModalOpen(true)
                setTimeout(function () {
                    closeModal()
                }, 1500)
            } else {
                setUpdateStatus(false);
                setUpdateMessage('Erreur lors de la mise à jour des équipes pour la nouvelle saison : ' + response.data.message);
                setIsModalOpen(true)
            }
        } catch (error) {
            setUpdateStatus(false);
            console.log(error)
            setUpdateMessage('Erreur lors de la mise à jour des équipes pour la nouvelle saison : ' + error.response.data.message);
            setIsModalOpen(true)
        }
    };

    const updateAllMatchs = async (competitionId) => {
      try {
        const response = await axios.patch(`${apiUrl}/api/admin/matchs/update-all`, {
          competitionId,
        }, {
          headers: {'Authorization': `Bearer ${token}`}
        });
        if (response.status === 200) {
          setUpdateStatus(true);
          setUpdateMessage('Matchs mis à jour !');
          setIsModalOpen(true)
          setTimeout(function () {
            closeModal()
          }, 1500)
        } else {
          setUpdateStatus(false);
          setUpdateMessage('Erreur lors de la mise à jour des matchs : ' + response.data.message);
          setIsModalOpen(true)
        }
      } catch (error) {
        setUpdateStatus(false);
        console.log(error)
        setUpdateMessage('Erreur lors de la mise à jour des matchs : ' + error.response.data.message);
      }
    };

  const closeModal = () => {
    setUpdateStatus(false);
    setUpdateMessage('');
    setIsModalOpen(false);
  };

  if (error) return <p>Erreur : {error.message}</p>;

  return (
      isLoading ? (
          <p>Chargement...</p>
      ) : (
          <div className="inline-block w-full h-auto py-20">
            <Link
                to="/admin"
                className="swiper-button-prev w-[30px] h-[30px] rounded-full bg-white top-7 left-2 shadow-flat-black-adjust border-2 border-black transition-all duration-300 hover:shadow-none focus:shadow-none"
            >
              <img src={arrowIcon} alt="Icône flèche"/>
            </Link>
            <SimpleTitle title={"Données des competitions"} />
            <div className="mt-4 px-8 flex flex-row flex-wrap justify-evenly items-center">
              {competitions.length > 0 ? (
                  competitions.map(competition => (
                      <div key={competition.id}
                           className="relative flex flex-col items-center justify-between w-full my-8 p-4 border border-black shadow-flat-black">
                          <img className="w-[50px] absolute z-[1] top-1 left-1" src={competition.emblem} alt=""/>
                          <div className="relative z-[2] my-4">
                              <h2 className="font-title uppercase text-xl3 font-bold">{competition.name}</h2>
                          </div>
                        <div className="relative z-[2]  flex flex-col justify-start">
                          <div className="flex flex-row justify-between items-center my-2">
                            <p className="w-2/3">Mettre a jour les infos de la ligue</p>
                            <button className="border border-black rounded-xl px-8 py-2">
                              <img className="w-[20px] h-[20px]" src={downloadIcon} alt=""/>
                            </button>
                          </div>
                          <div className="flex flex-row justify-between items-center my-2">
                            <p className="w-2/3">Mettre a jour les équipes</p>
                            <button onClick={() => handleUpdateCompetitionTeamsNewSeason(competition.id)}
                                    className="border border-black rounded-xl px-8 py-2">
                              <img className="w-[20px] h-[20px]" src={downloadIcon} alt=""/>
                            </button>
                          </div>
                          <div className="flex flex-row justify-between items-center my-2">
                            <p className="w-2/3">Mettre a jour les matchs</p>
                            <button onClick={() => updateAllMatchs(competition.id)}
                                    className="border border-black rounded-xl px-8 py-2">
                              <img className="w-[20px] h-[20px]" src={downloadIcon} alt=""/>
                            </button>
                          </div>
                        </div>
                      </div>
                  ))
              ) : (
                <p>Aucune competition</p>
              )}
            </div>
          </div>
      )
  );
}

export default AdminCompetitions;