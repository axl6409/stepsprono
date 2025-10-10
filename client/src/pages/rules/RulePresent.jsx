// RulePresent.jsx
import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import AlertModal from '../../components/modals/AlertModal.jsx';
import { UserContext } from '../../contexts/UserContext.jsx';
import SimpleTitle from '../../components/partials/SimpleTitle.jsx';
import BackButton from "../../components/nav/BackButton.jsx";
import {RuleContext} from "../../contexts/RuleContext.jsx";

const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const RulePresent = () => {
  const { user, updateUserStatus } = useContext(UserContext);
  const { currentRule } = useContext(RuleContext);
  const [cookies] = useCookies(['token']);
  const token = localStorage.getItem('token') || cookies.token;
  const [reglement, setReglement] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState(null);
  const navigate = useNavigate();
  const [showVideo, setShowVideo] = useState(user?.status === "ruled");
  const [videoEnded, setVideoEnded] = useState(false);
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);

  const handleAccept = async () => {
    try {
      const res = await axios.patch(
        `${apiUrl}/api/user/${user.id}/unruled`,
        { userId: user.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.status === 200) {
        updateUserStatus('approved');

        setAlertMessage('MAAASSSAAACRE !!!');
        setAlertType('success');

        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 1500);
      }
    } catch (err) {
      console.error("Erreur lors de l'acceptation du réglement :", err);
      setAlertMessage("Impossible d'accepter le règlement");
      setAlertType('error');
      setTimeout(() => setAlertMessage(''), 2000);
    }
  };

  const handleReplay = () => {
    setShowVideo(true);
    setVideoEnded(false);
  };

  useEffect(() => {
    if (!showVideo) return;
    const v = videoRef.current;
    if (!v) return;

    const tryPlay = async () => {
      try {
        await v.play(); // essaie avec l’état courant
      } catch {
        v.muted = true; // force muet si bloqué
        try { await v.play(); } catch {}
      }
    };

    v.load(); // certains navigateurs exigent load() avant play()
    tryPlay();
  }, [showVideo]);

  return (
    <div className="reglement-container flex flex-col justify-center h-screen relative z-20 px-8 py-12">
      <AlertModal message={alertMessage} type={alertType} />

      {showVideo && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <video
            ref={videoRef}
            src={currentRule.config?.video_url}
            className="w-full h-full object-contain md:object-cover"
            autoPlay
            muted={isMuted}
            playsInline
            preload="auto"
            onEnded={() => { setShowVideo(false); setVideoEnded(true); }}
            onContextMenu={(e)=>e.preventDefault()}
            controls={false}
            disablePictureInPicture
            controlsList="nodownload noplaybackrate noremoteplayback nofullscreen"
          />
          {isMuted && (
            <button
              translate="no"
              onClick={() => { setIsMuted(false); videoRef.current?.play(); }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur px-4 py-2 rounded-full border border-white text-white"
            >
              Activer le son
            </button>
          )}
        </div>
      )}

      {user.status === "approved" && (
        <BackButton/>
      )}

      <SimpleTitle
        title={currentRule.name}
        stickyStatus={false}
        uppercase
        fontSize="2.5rem"
      />

      <div
        translate="no"
        className="my-12 border border-black rounded-xl bg-white shadow-flat-black p-4"
      >
        <h2 className="font-rubik text-xl text-center font-bold text-black uppercase !m-0">Règle</h2>
        <p translate="no">
          {currentRule.config?.description}
        </p>
      </div>

      <div className="w-full flex justify-center mb-4">
        <button
          translate="no"
          onClick={handleReplay}
          className="w-3/5 fade-in block relative my-4 mx-auto before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-black before:border-black before:border group"
        >
          <span className="no-correct relative z-[2] w-full block border border-black text-black uppercase font-regular text-xs font-roboto px-3 py-2 rounded-full text-center shadow-md bg-blue-light transition -translate-y-1.5 group-hover:-translate-y-0">Voir la vidéo</span>
        </button>
      </div>

      {user.status === "ruled" && (
        <>
          <button
            translate="no"
            onClick={handleAccept}
            className="w-4/5 block my-4 mx-auto relative before:content-[''] before:absolute before:inset-0 before:rounded-full before:bg-black before:border before:border-black group"
          >
            <span className="relative z-10 block w-full border border-black text-black uppercase font-roboto px-3 py-2 rounded-full bg-green-light transition-transform -translate-y-1.5 group-hover:-translate-y-0.5">
              Go !!!
            </span>
          </button>
        </>
      )}
    </div>
  );
};

export default RulePresent;