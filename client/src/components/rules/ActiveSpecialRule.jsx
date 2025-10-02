import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import HuntDay from "./HuntDay.jsx";
import HiddenPredictions from "./HiddenPredictions.jsx";
import AllianceDay from "./AllianceDay.jsx";

const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const ActiveSpecialRule = ({currentRule, user, viewedUser, isOwnProfile}) => {
  if (!currentRule) return null;

  const [cookies] = useCookies(['token']);
  const token = localStorage.getItem('token') || cookies.token;

  const isActiveNow = currentRule.status === true;

  if (!isActiveNow) return null;

  const renderByRule = () => {
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
      case "goal_day":
      case "high_penalty_day":
      case "massacre_day":
      case "swap_predictions":
      case "mystery_box":
      default:
        return null;
    }
  };

  return (
    <div className="">
      {renderByRule()}
    </div>
  );
};

export default ActiveSpecialRule;
