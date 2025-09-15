import React, {useState, useEffect, useRef, useContext} from 'react';
import defaultUserImage from "../../assets/components/user/default-user-profile.png";
import defaultTeamImage from "../../assets/components/icons/hidden-trophy.webp";
import chasedUserImage from "../../assets/components/rules/jour-de-chasse-icon.png";
import {RuleContext} from "../../contexts/RuleContext.jsx";
import SimpleTitle from "../partials/SimpleTitle.jsx";
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const ProfilePic = ({ user }) => {
  const { currentRule } = useContext(RuleContext);
  const [flipped, setFlipped] = useState(false);
  const [scrollTilt, setScrollTilt] = useState(0);
  const lastScrollY = useRef(0);
  const [isChased, setIsChased] = useState(false);

  useEffect(() => {
    if (currentRule?.id === 1 && user.id === currentRule.config?.selected_user) {
      setIsChased(true);
    } else {
      setIsChased(false);
    }
  }, [currentRule, user.id]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY.current;
      lastScrollY.current = currentScrollY;

      const tilt = Math.max(-30, Math.min(30, delta * 10));
      setScrollTilt(tilt);

      clearTimeout(window._scrollTiltTimeout);
      window._scrollTiltTimeout = setTimeout(() => setScrollTilt(0), 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="relative w-[200px] h-[200px] mx-auto profile-pic_shadow"
      style={{perspective: '1000px'}}
      onClick={() => setFlipped(!flipped)}
    >
      <div
        className="profile_pic-container anim-rotate-attract relative w-full h-full transition-transform duration-300 delay-50 ease-in-out"
        style={{
          transformStyle: 'preserve-3d',
          transform: `
            rotateY(${flipped ? 180 : 0}deg)
            rotateX(${scrollTilt}deg)
          `
        }}
      >
        <div className="absolute inset-0 bg-white rounded-full border-2 border-black">
          <img
            className="w-full h-full object-cover rounded-full"
            src={user.img ? `${apiUrl}/uploads/users/${user.id}/${user.img}` : defaultUserImage}
            alt="Image de profil"
          />
        </div>
        <div className="absolute inset-0 bg-white rounded-full border-2 border-black flex justify-center items-center p-8">
          <img
            className="h-full w-full object-contain -scale-x-100"
            src={user.team_id ? `${apiUrl}/uploads/teams/${user.team_id}/${user.team?.logo_url}` : defaultTeamImage}
            alt=""
          />
        </div>
      </div>

      {/* Si l’utilisateur est la cible */}
      {isChased && (
        <div className="absolute anim-rotate-attract inset-0 rounded-full scale-[1.2] z-20">
          <img
            className="h-full w-full object-contain -scale-x-100"
            src={chasedUserImage}
            alt=""
          />
        </div>
      )}
    </div>
  );
};

export default ProfilePic;
