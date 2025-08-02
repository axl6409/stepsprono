// Reglement.jsx
import React, {useState, useEffect, useContext} from 'react';
import axios from 'axios';
import {useNavigate} from "react-router-dom";
import {useCookies} from "react-cookie";
import AlertModal from "../components/partials/modals/AlertModal.jsx";
import {UserContext} from "../contexts/UserContext.jsx";
import SimpleTitle from "../components/partials/SimpleTitle.jsx";
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const Reglement = () => {
  const { user, isAuthenticated } = useContext(UserContext);
  const [cookies, setCookie] = useCookies(["user"]);
  const token = localStorage.getItem('token') || cookies.token
  const [reglement, setReglement] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReglement = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/app/reglement`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        const reglementData = response.data.options.Value;
        setReglement(reglementData);
      } catch (error) {
        console.error('Erreur lors de la récupération du règlement:', error);
      }
    };

    fetchReglement();
  }, [token]);

  const handleAccept = async (userId) => {
    try {
      const response = await axios.patch(`${apiUrl}/api/user/${userId}/accepted`, {
        userId: userId
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 200) {
        setAlertMessage('Règlement accepté !');
        setAlertType('success');
        setTimeout(() => {
          setAlertMessage('')
          navigate('/dashboard');
        }, 2000);
      }
    } catch (error) {
      console.error("Erreur lors de l'acceptation du réglement : ", error);
    }
  };

  const handleRefuse = async () => {
    setAlertMessage('Pas le choix mon reuf');
    setAlertType('error');
    setTimeout(() => {
      setAlertMessage('')
    }, 2000);
  };

  return (
    <div className="reglement-container px-8 py-12">
      <AlertModal message={alertMessage} type={alertType} />
      <SimpleTitle title={"RÈGLEMENT INTÉRIEUR"} stickyStatus={false} uppercase={true} fontSize={'2.5rem'} />
      <div translate="no" className="my-12" dangerouslySetInnerHTML={{__html: reglement}}/>
      <button
        onClick={() => handleRefuse()}
        className="w-4/5 block relative my-4 mx-auto before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-black before:border-black before:border group"
      >
        <span
          translate="no"
          className="relative z-[2] w-full block border border-black text-black uppercase font-regular text-l font-roboto px-3 py-2 rounded-full text-center shadow-md bg-blue-light transition -translate-y-1.5 group-hover:-translate-y-0"
        >
          Je refuse
        </span>
      </button>
      <button
        onClick={() => handleAccept(user.id)}
        className="w-4/5 block relative my-4 mx-auto before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-black before:border-black before:border group"
      >
        <span
          translate="no"
          className="relative z-[2] w-full block border border-black text-black uppercase font-regular text-l font-roboto px-3 py-2 rounded-full text-center shadow-md bg-blue-light transition -translate-y-1.5 group-hover:-translate-y-0"
        >
          J'accepte
        </span>
      </button>
    </div>
  );
};

export default Reglement;
