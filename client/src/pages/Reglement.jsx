// Reglement.jsx
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import AlertModal from '../components/partials/modals/AlertModal.jsx';
import { UserContext } from '../contexts/UserContext.jsx';
import SimpleTitle from '../components/partials/SimpleTitle.jsx';
import BackButton from "../components/nav/BackButton.jsx";

const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const Reglement = () => {
  const { user, updateUserStatus } = useContext(UserContext);
  const [cookies] = useCookies(['token']);
  const token = localStorage.getItem('token') || cookies.token;
  const [reglement, setReglement] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState(null);
  const navigate = useNavigate();

  // Récupère le texte du règlement
  useEffect(() => {
    axios.get(`${apiUrl}/api/app/reglement`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setReglement(res.data.options.Value))
      .catch(err => console.error('Erreur fetch reglement:', err));
  }, [token]);

  const handleAccept = async () => {
    try {
      const res = await axios.patch(
        `${apiUrl}/api/user/${user.id}/accepted`,
        { userId: user.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.status === 200) {
        // 1) Mise à jour immédiate du contexte
        updateUserStatus('approved');

        // 2) Feedback utilisateur
        setAlertMessage('Règlement accepté !');
        setAlertType('success');

        // 3) On redirige vers le dashboard
        //    (on peut laisser un tout petit délai pour afficher le modal)
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 500);
      }
    } catch (err) {
      console.error("Erreur lors de l'acceptation du réglement :", err);
      setAlertMessage("Impossible d'accepter le règlement");
      setAlertType('error');
      setTimeout(() => setAlertMessage(''), 2000);
    }
  };

  const handleRefuse = () => {
    setAlertMessage('Vous devez accepter pour continuer.');
    setAlertType('error');
    setTimeout(() => setAlertMessage(''), 2000);
  };

  return (
    <div className="reglement-container relative z-10 px-8 py-12">
      <AlertModal message={alertMessage} type={alertType} />

      {user.status !== "pending" && (
        <BackButton/>
      )}

      <SimpleTitle
        title="RÈGLEMENT INTÉRIEUR"
        stickyStatus={false}
        uppercase
        fontSize="2.5rem"
      />

      <div
        translate="no"
        className="my-12"
        dangerouslySetInnerHTML={{ __html: reglement }}
      />

      {user.status === "pending" && (
        <>
          <button
            onClick={handleRefuse}
            className="w-4/5 block my-4 mx-auto relative before:content-[''] before:absolute before:inset-0 before:rounded-full before:bg-black before:border before:border-black group"
          >
            <span className="relative z-10 block w-full border border-black text-black uppercase font-roboto px-3 py-2 rounded-full bg-blue-light transition-transform group-hover:-translate-y-0.5">
              Je refuse
            </span>
          </button>
          <button
            onClick={handleAccept}
            className="w-4/5 block my-4 mx-auto relative before:content-[''] before:absolute before:inset-0 before:rounded-full before:bg-black before:border before:border-black group"
          >
            <span className="relative z-10 block w-full border border-black text-black uppercase font-roboto px-3 py-2 rounded-full bg-blue-light transition-transform group-hover:-translate-y-0.5">
              J&apos;accepte
            </span>
          </button>
        </>
      )}
    </div>
  );
};

export default Reglement;