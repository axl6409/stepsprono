import React, {useState, useEffect, useRef} from 'react';
import defaultUserImage from "../../assets/components/user/default-user-profile.png";
import defaultTeamImage from "../../assets/components/icons/hidden-trophy.webp";
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

/**
 * Component affichant une image de profil en 3D avec un effet de rotation lors du scroll.
 * @param {object} user - L'utilisateur dont on affiche l'image de profil
 * @returns {React.ReactElement} Un élément JSX affichant l'image de profil
 */
const ProfilePic = ({ user }) => {
  const [flipped, setFlipped] = useState(false);
  const [scrollTilt, setScrollTilt] = useState(0);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // On calcule la direction (vers le bas ou vers le haut)
      const delta = currentScrollY - lastScrollY.current;
      lastScrollY.current = currentScrollY;

      // Limite la valeur entre -10 et 10 degrés
      const tilt = Math.max(-30, Math.min(30, delta * 10));
      setScrollTilt(tilt);

      // Retour progressif à 0 après 300ms
      clearTimeout(window._scrollTiltTimeout);
      window._scrollTiltTimeout = setTimeout(() => setScrollTilt(0), 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  console.log(user)
  return (
    <div
      className="relative w-[200px] h-[200px] mx-auto profile-pic_shadow"
      style={{perspective: '1000px'}}
      onClick={() => setFlipped(!flipped)}
    >
      <div
        className={`profile_pic-container anim-rotate-attract relative w-full h-full transition-transform duration-300 delay-50 ease-in-out`}
        style={{
          transformStyle: 'preserve-3d',
          transform: `
            rotateY(${flipped ? 180 : 0}deg)
            rotateX(${scrollTilt}deg)
          `
        }}
      >
        <div
          className="absolute inset-0 bg-white rounded-full border-2 border-black"
        >
          <img
            className="w-full h-full object-cover rounded-full"
            src={user.img ? `${apiUrl}/uploads/users/${user.id}/${user.img}` : defaultUserImage}
            alt="Image de profil"
          />
        </div>
        <div
          className="absolute inset-0 bg-white rounded-full border-2 border-black flex justify-center items-center p-8"
        >
          <img
            className="h-full w-full object-contain -scale-x-100"
            src={user.team_id ? `${apiUrl}/uploads/teams/${user.team_id}/${user.team?.logo_url}` : defaultTeamImage}
            alt=""
          />
        </div>
      </div>
    </div>
  );
};

export default ProfilePic;