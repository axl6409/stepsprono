import React, { useState } from 'react';
import iconUserOpacity from '../../../assets/components/user/icon-user-purple-opacity.png';

const BgUser = () => {

  return (
    <div className="bg-user absolute inset-0 z-[1]">
      <img className="absolute top-0 -right-4" src={iconUserOpacity} alt=""/>
      <img className="absolute top-2 left-2" src={iconUserOpacity} alt=""/>
      <img className="absolute top-1/4 left-1/3 rotate-45 w-32" src={iconUserOpacity} alt=""/>
      <img className="absolute top-1/2 -left-4" src={iconUserOpacity} alt=""/>
      <img className="absolute top-1/2 -right-12 w-32" src={iconUserOpacity} alt=""/>
      <img className="absolute bottom-0 -left-8 w-32" src={iconUserOpacity} alt=""/>
      <img className="absolute bottom-0 -right-2 rotate-45" src={iconUserOpacity} alt=""/>
    </div>
  )
}

export default BgUser;