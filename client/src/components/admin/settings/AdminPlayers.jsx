import React, { useEffect, useState, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import 'swiper/css/navigation';
import axios from "axios";
import { Navigation } from 'swiper/modules';
import SwiperArrow from "../../../assets/icons/swiper-arrow.svg";
import PlayerForm from "../PlayerForm.jsx";
import { useCookies } from "react-cookie";
import { Link } from "react-router-dom";
import arrowIcon from "../../../assets/icons/arrow-left.svg";

const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const AdminPlayers = () => {
    const [cookies] = useCookies(['token']);
    const token = localStorage.getItem('token') || cookies.token;
    const [teams, setTeams] = useState([]);
    const [players, setPlayers] = useState([]);
    const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const swiperRef = useRef(null);

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
                setIsLoading(false);
                if (teamsData.length > 0) {
                    setSelectedTeam(teamsData[0]);
                }
            } catch (error) {
                console.error('Erreur lors de la récupération des équipes :', error);
                setError(error);
                setIsLoading(false);
            }
        };
        fetchTeams();
    }, [token]);

    useEffect(() => {
        if (selectedTeam) {
            const fetchPlayers = async () => {
                try {
                    const response = await axios.get(`${apiUrl}/api/players?teamId1=${selectedTeam.team_id}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        }
                    });
                    setPlayers(response.data || []);
                    setIsLoading(false);
                } catch (error) {
                    console.error('Erreur lors de la récupération des joueurs :', error);
                    setError(error);
                    setIsLoading(false);
                }
            }
            fetchPlayers();
        }
    }, [selectedTeam, token]);

    const handleTeamChange = (team) => {
        setSelectedTeam(team);
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
        handleTeamChange(team);
        updateSlideClasses();
    };

    const handleSlideClick = (team, index) => {
        handleTeamChange(team);
        if (swiperRef.current) {
            const swiper = swiperRef.current.swiper;
            swiper.slideTo(index);
            updateSlideClasses();
        }
    };

    const openPlayerForm = (playerId) => {
        const player = players.find(p => p.Player.id === playerId);
        setSelectedPlayer(player);
    };

    const updatePlayers = async () => {
        if (!selectedTeam) return;
        try {
            const selectedIndex = teams.findIndex(team => team.team_id === selectedTeam.team_id);
            setIsLoading(true);
            await axios.post(`${apiUrl}/api/players/update`, { teamId: selectedTeam.team_id }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            const response = await axios.get(`${apiUrl}/api/players?teamId1=${selectedTeam.team_id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            setPlayers(response.data || []);
            setIsLoading(false);
            if (swiperRef.current && swiperRef.current.swiper) {
                swiperRef.current.swiper.slideTo(selectedIndex);
                handleTeamChange(teams[selectedIndex]);
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour des joueurs :', error);
            setError(error);
            setIsLoading(false);
        }
    };

    if (error) return <p>Erreur : {error.message}</p>;
    console.log(players)
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
                <h1 className={`font-black mb-12 text-center relative w-fit mx-auto text-xl4 leading-[50px]`}>
                    Gestion des joueurs
                    <span
                        className="absolute left-0 top-0 right-0 text-purple-soft z-[-1] translate-x-0.5 translate-y-0.5">Gestion des joueurs</span>
                    <span className="absolute left-0 top-0 right-0 text-green-soft z-[-2] translate-x-1 translate-y-1">Gestion des joueurs</span>
                </h1>
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
                    className="historySwiper flex flex-col justify-start px-8 relative mb-12 before:content-[''] before:block before:absolute before:w-auto before:mx-8 before:inset-0 before:bg-transparent before:border before:border-black before:rounded-xl"
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
                <button
                    onClick={updatePlayers}
                    className="px-4 py-2 bg-green-500 text-white rounded mb-4"
                >
                    Mettre à jour les joueurs
                </button>
                <div className="mt-4 flex flex-row flex-wrap justify-evenly items-center">
                    {players.length > 0 ? (
                        players.map(player => (
                            <div key={player.Player.id}
                                 className="flex flex-col items-center justify-between w-[100px] h-full my-8 p-4 border border-black rounded-lg shadow">
                                <p>{player.Player.id}</p>
                                <img src={player.Player.photo} alt={player.Player.name}
                                     className="w-10 h-10 rounded-full"/>
                                <span>{player.Player.name}</span>
                                <button onClick={() => openPlayerForm(player.Player.id)}
                                        className="px-3 py-1 bg-blue-500 text-white rounded">
                                    Modifier
                                </button>
                            </div>
                        ))
                    ) : (
                        <p>Sélectionnez une équipe pour voir ses joueurs.</p>
                    )}
                </div>
                {selectedPlayer && (
                    <PlayerForm player={selectedPlayer} onClose={() => setSelectedPlayer(null)} token={token}/>
                )}
            </div>
        )
    );
};

export default AdminPlayers;
