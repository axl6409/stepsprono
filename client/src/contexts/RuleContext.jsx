import React, {createContext, useState, useEffect, useContext} from "react";
import axios from "axios";
import {useCookies} from "react-cookie";
import {UserContext} from "./UserContext.jsx";
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

export const RuleContext = createContext();

export const RuleProvider = ({children}) => {
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated } = useContext(UserContext);
  const [cookies, setCookie, removeCookie] = useCookies(['token']);
  const token = localStorage.getItem('token') || cookies.token
  const [currentRule, setCurrentRule] = useState([]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchCurrentRule();
    }
  }, [user, isAuthenticated]);

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

  return (
    <RuleContext.Provider
      value={{
        fetchCurrentRule,
        currentRule,
      }}>
      {children}
    </RuleContext.Provider>
  )
}