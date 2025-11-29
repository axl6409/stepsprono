import React, { useEffect, useState } from 'react';
import { useCookies } from "react-cookie";
import axios from "axios";
import Loader from "../../components/partials/Loader.jsx";
import SimpleTitle from "../../components/partials/SimpleTitle.jsx";
import BackButton from "../../components/nav/BackButton.jsx";
import JoystickButton from "../../components/buttons/JoystickButton.jsx";
import checkGreen from "../../assets/icons/checked-green.svg";
import {Link} from "react-router-dom";

const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const AdminRules = () => {
  const [cookies] = useCookies(['token']);
  const token = localStorage.getItem('token') || cookies.token;
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('');
  const [specialDays, setSpecialDays] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSpecialDays();
  }, [token]);

  const fetchSpecialDays = async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/special-rules`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setSpecialDays(res.data);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les journées spéciales.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStatus = async (day) => {
    try {
      await axios.patch(`${apiUrl}/api/admin/special-rule/toggle/${day.id}`, {
        status: day.status !== true
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchSpecialDays();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleCheckRule = async (dayId) => {
    try {
      const res = await axios.get(`${apiUrl}/api/admin/special-rule/check/${dayId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 200) {
        setAlertMessage("Vérification effectuée avec succès.");
        setAlertType('success');
      }
    } catch (e) {
      setAlertMessage(`Erreur lors de la vérification : ${e.message}`);
      setAlertType('error');
    }
  }

  if (isLoading) return <Loader />;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="inline-block relative z-20 w-full h-auto py-20">
      <BackButton />

      <SimpleTitle title={"Journées à thème"} stickyStatus={false}/>

      <ul className="flex flex-col px-4">
        {specialDays
          .sort((a, b) => a.id - b.id)
          .map((day) => (
          <li key={day.id} className="relative flex flex-col w-full my-4 bg-white border border-black shadow-flat-black rounded-xl p-6">
            <div className="flex flex-row flex-wrap justify-between items-center">
              <h3 translate="no" className="font-bold w-full leading-5 uppercase text-xl text-center mb-4">{day.name}</h3>
              {day.config?.description && <p translate="no" className="text-sm mb-8 text-black">{day.config.description}</p>}
              <div className="flex flex-row w-full justify-between gap-2">
                <JoystickButton checked={day.status} mode={day.status === true ? "checked" : "trigger"} onChange={() => toggleStatus(day)} />
                <Link translate="no" className="px-4 py-2 bg-blue-light border border-black rounded-full shadow-flat-black" to={`/admin/special-rule/${day.id}`}>
                  Configurer
                </Link>
                <button className="absolute -right-2 -top-2 w-fit bg-white h-6 rounded-full border border-black py-1 px-4 shadow-flat-black-adjust cursor-pointer" onClick={() => toggleCheckRule(day.id) }>
                  <span className="block font-roboto text-xxs text-black font-regular leading-tight">Vérifier</span>
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminRules;
