import React, { useState } from 'react';
import iconMDPOpacity from '../../assets/components/user/icon-mdp-yellow-opacity.png';

const BgPassword = () => {

  return (
    <div className="bg-user absolute inset-0 z-[1]">
      <img className="absolute top-0 -right-4" src={iconMDPOpacity} alt=""/>
      <img className="absolute top-2 left-2" src={iconMDPOpacity} alt=""/>
      <img className="absolute top-1/4 left-1/3 rotate-45 w-32" src={iconMDPOpacity} alt=""/>
      <img className="absolute top-1/2 -left-4" src={iconMDPOpacity} alt=""/>
      <img className="absolute top-1/2 -right-12 w-32" src={iconMDPOpacity} alt=""/>
      <img className="absolute bottom-0 -left-8 w-32" src={iconMDPOpacity} alt=""/>
      <img className="absolute bottom-0 -right-2 rotate-45" src={iconMDPOpacity} alt=""/>
    </div>
  )
}

export default BgPassword;