import React, { useEffect, useState, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import 'swiper/css/navigation';
import axios from "axios";
import { Navigation } from 'swiper/modules';
import SwiperArrow from "../../assets/icons/swiper-arrow.svg";
import PlayerForm from "../../components/admin/PlayerForm.jsx";
import { useCookies } from "react-cookie";
import penIcon from "../../assets/icons/pencil.svg";
import SimpleTitle from "../../components/partials/SimpleTitle.jsx";
import BackButton from "../../components/nav/BackButton.jsx";
import Loader from "../../components/partials/Loader.jsx";
import PlayerActionModal from "../../components/admin/PlayerActionModal.jsx";

const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const AdminPlayers = () => {
    const [cookies] = useCookies(['token']);
    const token = localStorage.getItem('token') || cookies.token;
    const [teams, setTeams] = useState([]);
    const [players, setPlayers] = useState([]);
    const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [isPlayersLoading, setIsPlayersLoading] = useState(false);
    const [error, setError] = useState(null);
    const swiperRef = useRef(null);
    const positionGroups = {
      Goalkeeper: { order: 1, label: "Gardiens" },
      Defender:   { order: 2, label: "Défenseurs" },
      Midfielder: { order: 3, label: "Milieux" },
      Attacker:   { order: 4, label: "Attaquants" },
    };
    const positionOrder = {
      Goalkeeper: 1,
      Defender: 2,
      Midfielder: 3,
      Attacker: 4,
    };

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const response = await axios.get(`${apiUrl}/api/teams`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                });
                const teamsData = response.data.data || [];
                setTeams(teamsData);
                if (teamsData.length > 0) {
                    setSelectedTeam(teamsData[0]);
                }
            } catch (error) {
                console.error('Erreur lors de la récupération des équipes :', error);
                setError(error);
            } finally {
                setIsPageLoading(false);
            }
        };
        fetchTeams();
    }, [token]);

    useEffect(() => {
      if (!selectedTeam) return;
      setIsPlayersLoading(true);
      getPlayers(selectedTeam.team_id);
    }, [selectedTeam, token]);

    const getPlayers = async (teamId) => {
      if (!teamId) return;
      try {
        const response = await axios.get(`${apiUrl}/api/players?teamId1=${teamId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setPlayers((response.data || []).sort((a, b) => a.Player.id - b.Player.id));
      } catch (err) {
        console.error('Erreur lors de la récupération des joueurs :', err);
        setError(err);
      } finally {
        setIsPlayersLoading(false); // 👈 on ne démonte plus le slider
      }
    };

    const updatePlayers = async () => {
      if (!selectedTeam) return;
      try {
        const selectedIndex = teams.findIndex(t => t.team_id === selectedTeam.team_id);
        setIsPlayersLoading(true); // loader uniquement sur la liste, pas toute la page

        await axios.post(`${apiUrl}/api/admin/players/update`, { teamId: selectedTeam.team_id }, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        await getPlayers(selectedTeam.team_id);

        if (swiperRef.current?.swiper) {
          swiperRef.current.swiper.slideTo(selectedIndex);
        }
      } catch (err) {
        console.error('Erreur lors de la mise à jour des joueurs :', err);
        setError(err);
        setIsPlayersLoading(false);
      }
    };

    const handleTeamChange = (team) => {
      setSelectedTeam(team);
      const idx = teams.findIndex(t => t.team_id === team.team_id);
      if (idx >= 0) setCurrentTeamIndex(idx);
    };

    const updateSlideClasses = () => {
        if (swiperRef.current) {
            const swiper = swiperRef.current.swiper;
            swiper.slides.forEach((slide, index) => {
                slide.classList.remove('swiper-slide-active', 'swiper-slide-prev', 'swiper-slide-next');
                if (index === swiper.activeIndex) {
                    slide.classList.add('swiper-slide-active');
                } else if (index === swiper.activeIndex - 1) {
                    slide.classList.add('swiper-slide-prev');
                } else if (index === swiper.activeIndex + 1) {
                    slide.classList.add('swiper-slide-next');
                }
            });
        }
    };

    const handleSlideChange = (swiper) => {
      const team = teams[swiper.activeIndex];
      if (team) handleTeamChange(team);
      updateSlideClasses();
    };

    const handleSlideClick = (team, index) => {
      handleTeamChange(team);
      if (swiperRef.current?.swiper) {
        swiperRef.current.swiper.slideTo(index);
        updateSlideClasses();
      }
    };

    function decodeHtml(html) {
        const txt = document.createElement("textarea");
        txt.innerHTML = html;
        return txt.value;
    }

    if (error) return <p>Erreur : {error.message}</p>;

    return (
        isPageLoading ? (
            <Loader />
        ) : (
            <div className="inline-block relative z-20 w-full h-auto py-20">
                <BackButton />
                <SimpleTitle title={"Données des joueurs"} stickyStatus={false} uppercase={true} fontSize={'2rem'} />
                <Swiper
                    slidesPerView={5}
                    spaceBetween={10}
                    centeredSlides={true}
                    grabCursor={false}
                    navigation={{
                        nextEl: '.swiper-button-next',
                        prevEl: '.swiper-button-prev',
                    }}
                    onSlideChange={handleSlideChange}
                    onInit={updateSlideClasses}
                    modules={[Navigation]}
                    className="historySwiper flex flex-col justify-start px-8 relative mb-12 mt-8 before:content-[''] before:block before:absolute before:w-auto before:mx-8 before:inset-0 before:z-[1] before:bg-white before:bg-transparent before:border before:border-black before:rounded-xl"
                    ref={swiperRef}
                >
                    {teams.map((team, index) => (
                        <SwiperSlide
                            key={team.Team.id}
                            onClick={() => handleSlideClick(team, index)}
                            className={`transition-all duration-300 ease-in ${selectedTeam === team ? 'swiper-slide-active' : ''}`}
                        >
                            <div className="text-center font-roboto py-4 cursor-pointer">
                                <img src={apiUrl + "/uploads/teams/" + team.Team.id + "/" + team.Team.logo_url}
                                     alt={team.Team.name}
                                     className="h-[50px] w-[50px] mx-auto object-fit object-center relative z-[1]"/>
                            </div>
                        </SwiperSlide>
                    ))}
                    <div
                        className="swiper-button-prev overflow-visible mt-0 absolute shadow-md h-full w-8 left-0 top-0 bottom-0 flex flex-col justify-center items-center bg-white">
                        <img src={SwiperArrow} alt=""/>
                    </div>
                    <div
                        className="swiper-button-next overflow-visible mt-0 absolute shadow-md h-full w-8 right-0 top-0 bottom-0 flex flex-col justify-center items-center bg-white">
                        <img className="rotate-180" src={SwiperArrow} alt=""/>
                    </div>
                </Swiper>
              <div className="bg-white border border-black rounded-lg shadow-flat-black w-11/12 py-4 mx-auto">
                <button
                  translate="no"
                  onClick={updatePlayers}
                  className="w-4/5 fade-in block relative my-4 mx-auto before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-black before:border-black before:border group"
                >
                  <span className="no-correct relative z-[2] w-full block border border-black text-black uppercase font-regular text-xs font-roboto px-3 py-2 rounded-full text-center shadow-md bg-blue-light transition -translate-y-1 group-hover:-translate-y-0">Mettre à jour tous les joueurs</span>
                </button>
                <div className="mt-4 px-2 flex flex-row flex-wrap justify-evenly items-center">
                  {isPlayersLoading ? (
                    <Loader />
                  ) : players.length > 0 ? (
                    Object.entries(positionGroups)
                      .sort(([, a], [, b]) => a.order - b.order) // ordre défini
                      .map(([key, { label }]) => {

                        // joueurs du poste en cours
                        const groupPlayers = players
                          .filter(p => p.position === key)
                          .sort((a, b) => (a.number || 0) - (b.number || 0));

                        if (groupPlayers.length === 0) return null;

                        return (
                          <div key={key} className="w-full my-4">
                            <h3 className="font-roboto font-bold text-base uppercase mb-4">{label}</h3>
                            <div className="flex flex-col gap-4">
                              {groupPlayers.map(player => (
                                <div
                                  key={player.Player.id}
                                  onClick={() => setSelectedPlayer(player)}
                                  className="cursor-pointer relative flex flex-row items-center justify-between w-full h-auto py-4 px-2 border border-black rounded-lg shadow-flat-black-adjust"
                                >
                                  <span
                                    translate="no"
                                    className="w-fit absolute z-[5] -top-3 left-2 font-roboto font-bold text-xxs bg-white text-black px-2 py-0.5 rounded-md border border-black shadow-flat-black-adjust text-center"
                                  >
                                    #{player.Player.id}
                                  </span>
                                  <p
                                    translate="no"
                                    className="w-3/5 font-sans font-medium text-base"
                                  >
                                    {decodeHtml(player.Player.name)}
                                  </p>
                                  {player.number && (
                                    <span className="bg-yellow-light px-2 py-2 rounded-md">
                                      <span className="font-rubik font-bold text-xs border border-black rounded-md bg-white p-1">n°{player.number}</span>
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })
                  ) : (
                    <p translate="no">Sélectionnez une équipe pour voir ses joueurs.</p>
                  )}
                </div>
                {selectedPlayer && (
                  <PlayerActionModal
                    isOpen={!!selectedPlayer}
                    onClose={() => setSelectedPlayer(null)}
                    player={selectedPlayer}
                    teams={teams}
                    token={token}
                    onUpdated={() => getPlayers(selectedPlayer.Team?.id || selectedTeam?.team_id)}
                  />
                )}
              </div>
            </div>
        )
    );
};

export default AdminPlayers;
