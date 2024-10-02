import React from 'react';
import SettingFormSelect from "../partials/SettingFormSelect.jsx";
import SettingFormText from "../partials/SettingFormText.jsx";
import {useCookies} from "react-cookie";

const DynamicFormComponent = ({ setting, openModal, onRefresh }) => {
  const [cookies] = useCookies(['token']);
  const token = localStorage.getItem('token') || cookies.token

  switch (setting.type) {
    case 'select':
      return (
        <SettingFormSelect
          setting={setting}
          openModal={openModal}
          token={token}
        />
      );
    case 'text':
      return (
        <SettingFormText
          setting={setting}
          openModal={openModal}
          token={token}
        />
      );

    default:
      return <div>Type de réglage non pris en charge</div>;
  }
};

export default DynamicFormComponent;
