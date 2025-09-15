import React, { useEffect, useState } from 'react';
import { useCookies } from "react-cookie";
import axios from "axios";
import Loader from "../../components/partials/Loader.jsx";
import SimpleTitle from "../../components/partials/SimpleTitle.jsx";
import BackButton from "../../components/nav/BackButton.jsx";
import JoystickButton from "../../components/partials/buttons/JoystickButton.jsx";
import {Link} from "react-router-dom";

const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const AdminRules = () => {
  const [cookies] = useCookies(['token']);
  const token = localStorage.getItem('token') || cookies.token;

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
      console.log(res.data)
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
      console.log(day.status)
      fetchSpecialDays();
    } catch (err) {
      console.error(err);
    }
  };

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
          <li key={day.id} className="flex flex-col w-full my-4 bg-white border border-black shadow-flat-black rounded-xl p-6">
            <div className="flex flex-row flex-wrap justify-between items-center">
              <h3 className="font-bold w-full leading-5 uppercase text-xl text-center mb-4">{day.name}</h3>
              {day.config?.description && <p className="text-sm mb-8 text-black">{day.config.description}</p>}
              <div className="flex flex-row w-full justify-between gap-2">
                <JoystickButton checked={day.status} mode={day.status === true ? "checked" : "trigger"} onChange={() => toggleStatus(day)} />
                <Link className="px-4 py-2 bg-blue-light border border-black rounded-full shadow-flat-black" to={`/admin/special-rule/${day.id}`}>
                  Configurer
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminRules;
