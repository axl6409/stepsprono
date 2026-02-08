import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import HuntDay from "./HuntDay.jsx";
import HiddenPredictions from "./HiddenPredictions.jsx";
import AllianceDay from "./AllianceDay.jsx";
import HalfPenaltyDay from "./HalfPenaltyDay.jsx";
import MysteryBox from "./MysteryBox.jsx";
import GoalDay from "./GoalDay.jsx";

const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const ActiveSpecialRule = ({currentRule, user, viewedUser, isOwnProfile}) => {
  const [cookies] = useCookies(['token']);
  const token = localStorage.getItem('token') || cookies.token;
  const [hasUnusedGoldenTicket, setHasUnusedGoldenTicket] = useState(false);

  // Vérifier si l'utilisateur a un golden_ticket non utilisé
  useEffect(() => {
    const checkGoldenTicket = async () => {
      if (!viewedUser?.id || !token) return;

      try {
        const response = await axios.get(
          `${apiUrl}/api/mystery-box/user/${viewedUser.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.status === 200 && response.data) {
          const item = response.data;
          // Vérifier si c'est un golden_ticket non utilisé
          if (item.item?.key === 'golden_ticket' && !item.usage?.used) {
            setHasUnusedGoldenTicket(true);
          } else {
            setHasUnusedGoldenTicket(false);
          }
        }
      } catch (error) {
        // Pas d'item ou erreur, ignorer
        setHasUnusedGoldenTicket(false);
      }
    };

    checkGoldenTicket();
  }, [viewedUser?.id, token]);

  const isActiveNow = currentRule?.status === true;
  const isMysteryBoxRule = currentRule?.rule_key === 'mystery_box';

  const renderByRule = () => {
    if (!currentRule || !isActiveNow) return null;

    switch (currentRule.rule_key) {
      case "hunt_day":
        return (
          <HuntDay
            rule={currentRule}
            user={user}
            viewedUser={viewedUser}
            isOwnProfile={isOwnProfile}
          />
        );
      case "hidden_predictions":
        return (
          <HiddenPredictions
            rule={currentRule}
            user={user}
            viewedUser={viewedUser}
            isOwnProfile={isOwnProfile}
            />
        );
      case "alliance_day":
        return (
          <AllianceDay
            rule={currentRule}
            user={user}
            viewedUser={viewedUser}
            isOwnProfile={isOwnProfile}
          />
        );
      case "half_penalty_day":
        return (
          <HalfPenaltyDay
            rule={currentRule}
            user={user}
            viewedUser={viewedUser}
            isOwnProfile={isOwnProfile}
          />
        );
      case "mystery_box":
        return (
          <MysteryBox
            rule={currentRule}
            user={user}
            viewedUser={viewedUser}
            isOwnProfile={isOwnProfile}
          />
        );
      case "goal_day":
        return (
          <GoalDay
            rule={currentRule}
            user={user}
            viewedUser={viewedUser}
            isOwnProfile={isOwnProfile}
          />
        );
      case "high_penalty_day":
      case "massacre_day":
      case "swap_predictions":
      default:
        return null;
    }
  };

  // Afficher le golden_ticket non utilisé si la règle actuelle n'est pas mystery_box
  const showGoldenTicket = hasUnusedGoldenTicket && !isMysteryBoxRule;

  return (
    <div className="">
      {renderByRule()}
      {showGoldenTicket && (
        <MysteryBox
          rule={null}
          user={user}
          viewedUser={viewedUser}
          isOwnProfile={isOwnProfile}
        />
      )}
    </div>
  );
};

export default ActiveSpecialRule;
