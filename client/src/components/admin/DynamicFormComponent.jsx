import React from 'react';
import SettingFormSelect from "../partials/SettingFormSelect.jsx";
import SettingFormText from "../partials/SettingFormText.jsx";

const DynamicFormComponent = ({ setting, handleSelectChange, selectedOptions, openModal, handleSubmit }) => {
  switch (setting.type) {
    case 'select':
      return (
        <SettingFormSelect
          setting={setting}
          handleSelectChange={handleSelectChange}
          selectedOptions={selectedOptions}
          openModal={openModal}
          handleSubmit={handleSubmit}
        />
      );
    case 'text':
      return (
        <SettingFormText
          setting={setting}
          handleSelectChange={handleSelectChange}
          selectedOptions={selectedOptions}
          openModal={openModal}
          handleSubmit={handleSubmit}
        />
      );

    default:
      return <div>Type de réglage non pris en charge</div>;
  }
};

export default DynamicFormComponent;
