import React, { useState } from 'react';
import iconMailOpacity from '../../../assets/components/user/icon-mail-green-opacity.png';

const BgEmail = () => {

  return (
    <div className="bg-user absolute inset-0">
      <img src={iconMailOpacity} alt=""/>
      <img src={iconMailOpacity} alt=""/>
      <img src={iconMailOpacity} alt=""/>
      <img src={iconMailOpacity} alt=""/>
      <img src={iconMailOpacity} alt=""/>
      <img src={iconMailOpacity} alt=""/>
      <img src={iconMailOpacity} alt=""/>
    </div>
  )
}

export default BgEmail;