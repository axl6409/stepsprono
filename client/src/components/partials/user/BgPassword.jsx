import React, { useState } from 'react';
import iconMDPOpacity from '../../../assets/components/user/icon-mdp-yellow-opacity.png';

const BgPassword = () => {

  return (
    <div className="bg-user absolute inset-0">
      <img src={iconMDPOpacity} alt=""/>
      <img src={iconMDPOpacity} alt=""/>
      <img src={iconMDPOpacity} alt=""/>
      <img src={iconMDPOpacity} alt=""/>
      <img src={iconMDPOpacity} alt=""/>
      <img src={iconMDPOpacity} alt=""/>
      <img src={iconMDPOpacity} alt=""/>
    </div>
  )
}

export default BgPassword;