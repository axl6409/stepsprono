import React, {createContext, useState, useEffect, useContext, useRef} from "react";
import axios from "axios";
import {useCookies} from "react-cookie";
import {UserContext} from "./UserContext.jsx";
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

export const RuleContext = createContext();

export const RuleProvider = ({children}) => {
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated } = useContext(UserContext);
  const audioRef = useRef(null);
  const [cookies, setCookie, removeCookie] = useCookies(['token']);
  const token = localStorage.getItem('token') || cookies.token
  const [currentRule, setCurrentRule] = useState([]);
  const [audioPlayed, setAudioPlayed] = useState(
    sessionStorage.getItem("audioPlayed") === "true"
  );

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchCurrentRule();
    }
  }, [user, isAuthenticated, audioPlayed]);

  const fetchCurrentRule = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/special-rule/current`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })
      setCurrentRule(response.data)
      if (response.data.id === 1) {
        const selectedUser = await axios.get(`${apiUrl}/api/user/${response.data.config.selected_user}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        })
        setCurrentRule({...response.data, selectedUserDatas: selectedUser.data})
      }
    } catch (error) {
      console.error(error)
    }
  }

  const fetchMatchdayRule = async (matchday) => {
    try {
      const response = await axios.get(`${apiUrl}/api/special-rule/matchday/${matchday}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })
      if (response.status === 204) {
        return null
      }
      return response.data
    } catch (error) {
      console.error(error)
    }
  }

  const playAudio = () => {
    if (currentRule.rule_key === 'hunt_day' && !audioPlayed) {
      if (!audioRef.current) {
        audioRef.current = new Audio("/audio/jour-de-chasse.mp3");
        audioRef.current.volume = 1.0;
        audioRef.current.muted = false;
      }
      audioRef.current.play()
        .then(() => {
          console.log("Lecture OK → stockage dans sessionStorage");
          setAudioPlayed(true);
          sessionStorage.setItem("audioPlayed", "true");
        })
        .catch(err => console.warn("Erreur lecture :", err));
    }
  };

  return (
    <RuleContext.Provider
      value={{
        fetchCurrentRule,
        fetchMatchdayRule,
        currentRule,
        playAudio,
        audioPlayed
      }}>
      {children}
    </RuleContext.Provider>
  )
}