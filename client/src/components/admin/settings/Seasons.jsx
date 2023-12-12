import React from 'react';
import SettingFormSelect from "../partials/SettingFormSelect.jsx";
import SettingFormText from "../partials/SettingFormText.jsx";
import {useCookies} from "react-cookie";

const Seasons = ({ setting, openModal, onRefresh }) => {
  const [cookies] = useCookies(['token']);
  const token = localStorage.getItem('token') || cookies.token

  return (
    <div>
      <h2>Les Saisons</h2>
    </div>
  )
};

export default Seasons;
