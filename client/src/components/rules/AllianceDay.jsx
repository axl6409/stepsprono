import React, {useState, useEffect, useContext} from 'react';
import { useCookies } from 'react-cookie';
import chasedRuleIcon from "../../assets/components/rules/alliance_day.png";
import { Link } from "react-router-dom";
import SimpleTitle from "../partials/SimpleTitle.jsx";
import chasedUserImage from "../../assets/components/rules/jour-de-chasse-icon.png";
import AnimatedTitle from "../partials/AnimatedTitle.jsx";
import { RankingContext } from "../../contexts/RankingContext.jsx";
import monthPointsShape from "../../assets/components/dashboard/week/week-points-shape.png";
import totalContribText from "../../assets/components/rules/points-duo.webp";

const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const AllianceDay = ({ rule, user, viewedUser, isOwnProfile }) => {
  const [cookies] = useCookies(['token']);
  const { weekRanking, fetchRanking } = useContext(RankingContext);

  const referenceUserId = isOwnProfile ? user.id : viewedUser?.id;

  const myGroup = rule.config?.selected_users?.find(group =>
    group.some(u => u.id === referenceUserId)
  );
  const partner = myGroup ? myGroup.find(u => u.id !== referenceUserId) : null;

  // Calculate duo points from week ranking only
  const [duoPoints, setDuoPoints] = useState(null);

  useEffect(() => {
    // Ensure week ranking is fetched
    fetchRanking('week');
  }, [fetchRanking]);

  useEffect(() => {
    if (partner && weekRanking !== undefined) {
      // If weekRanking is empty or users not found, default to 0 points
      const myRanking = weekRanking.find(r => r.user_id === referenceUserId);
      const partnerRanking = weekRanking.find(r => r.user_id === partner.id);

      const myPoints = myRanking ? myRanking.points : 0;
      const partnerPoints = partnerRanking ? partnerRanking.points : 0;

      setDuoPoints(myPoints + partnerPoints);
    }
  }, [partner, weekRanking, referenceUserId]);

  return (
    <div className="relative z-20 flex flex-col justify-center items-center mb-32 mt-8">
      <div className="w-full -rotate-[-8deg]">
        <img src={chasedRuleIcon} alt=""/>
      </div>
      <Link
        to="/alliance-day"
        className="w-fit absolute left-1/2 -translate-x-1/2 -top-6 fade-in block mx-auto before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-black before:border-black before:border group"
      >
        <span
          translate="no"
          className="relative z-[2] w-full block border border-black text-black uppercase font-regular text-sm font-roboto px-3 py-1 rounded-full text-center shadow-md bg-purple-light transition -translate-y-1 group-hover:-translate-y-0"
        >
          Voir la vidéo
        </span>
      </Link>
      {partner && (
        <div className="fade-in absolute right-4 -top-16 w-20 h-24">
          <Link to={`/dashboard/${partner.id}`}>
            <SimpleTitle
              stickyStatus={false}
              fontSize={16}
              title={partner.username}
              darkMode={false}
            />
            <div className="relative z-10 w-full h-20">
              <div className="absolute inset-0 rounded-full border-2 border-black shadow-md overflow-hidden z-10 bg-white">
                <img
                  className="w-full h-full object-cover"
                  src={`${apiUrl}/uploads/users/${partner.id}/${partner.img || 'default.png'}`}
                  alt={partner.username}
                />
              </div>
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 z-10">
                <p translate="no" className="text-xl4">🤝</p>
              </div>
            </div>
          </Link>
        </div>
      )}
      {partner && duoPoints !== null && (
        <div className="fade-in absolute -bottom-32 left-1/2 -translate-x-1/2 w-fit">
          <div className="relative w-36">
            <div className="w-full relative">
              <img className="block" src={monthPointsShape} alt=""/>
              <img className="absolute inset-0 rotate-animation delay-500 origin-center" src={totalContribText} alt=""/>
              <p translate="no" className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-rubik text-xl5 stroke-black font-black text-white leading-5">{duoPoints}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllianceDay;
