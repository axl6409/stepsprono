import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';

const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const BallePerduAlert = ({ userId }) => {
  const [cookies] = useCookies(['token']);
  const token = localStorage.getItem('token') || cookies.token;
  const [targetInfo, setTargetInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTargetInfo = async () => {
      try {
        const response = await axios.get(
          `${apiUrl}/api/mystery-box/balle-perdue/target`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.status === 200 && response.data) {
          setTargetInfo(response.data);
        }
      } catch (error) {
        // 204 ou erreur = pas de balle perdue
      } finally {
        setLoading(false);
      }
    };

    if (userId && token) {
      fetchTargetInfo();
    }
  }, [userId, token]);

  if (loading || !targetInfo) return null;

  return (
    <div className="w-full px-4 mb-4 fade-in">
      <div className="relative p-4 rounded-xl border-2 border-red-600 bg-red-100 shadow-flat-black">
        <div className="flex flex-row items-center gap-3">
          <div className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-black bg-red-500 text-2xl shadow-md">
            💥
          </div>
          <div className="flex-1">
            <h3 className="font-rubik font-bold text-base uppercase text-red-700">
              Balle Perdue !
            </h3>
            <p className="font-roboto text-sm text-red-800 leading-tight mt-1">
              <span className="font-bold">{targetInfo.shooter?.username}</span> t'a tire dessus !
              <br />
              <span className="font-medium">Tu perds {Math.abs(targetInfo.penalty)} point sur tes classements.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BallePerduAlert;
