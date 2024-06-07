import React, { useState } from 'react';
import iconTeamOpacity from '../../../assets/components/user/icon-heart-red-opacity.png';

const BgTeam = () => {

  return (
    <div className="bg-user absolute inset-0">
      <img src={iconTeamOpacity} alt=""/>
      <img src={iconTeamOpacity} alt=""/>
      <img src={iconTeamOpacity} alt=""/>
      <img src={iconTeamOpacity} alt=""/>
      <img src={iconTeamOpacity} alt=""/>
      <img src={iconTeamOpacity} alt=""/>
      <img src={iconTeamOpacity} alt=""/>
    </div>
  )
}

export default BgTeam;