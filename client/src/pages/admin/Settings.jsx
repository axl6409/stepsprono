import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {useCookies} from "react-cookie";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircleQuestion, faCircleXmark, faPaperPlane, faPen} from "@fortawesome/free-solid-svg-icons";
import InformationModal from "../../components/partials/InformationModal.jsx";
import SettingFormSelect from "../../components/partials/SettingFormSelect.jsx";

const Settings = () => {
  const [settings, setSettings] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [cookies] = useCookies(['token']);
  const token = localStorage.getItem('token') || cookies.token

  useEffect(() => {
    const fetchParams = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:3001/api/admin/settings', {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        const fetchedSettings = response.data
        setSettings(fetchedSettings)
        const initialSelectedOptions = {}
        const selectedOptionDescription = {}
        fetchedSettings.forEach(setting => {
          const selectedOptionKey = Object.keys(setting.options).find(key => setting.options[key].status === "true")
          if (selectedOptionKey) {
            initialSelectedOptions[setting.key] = selectedOptionKey
            selectedOptionDescription[setting.key] = setting.options[selectedOptionKey].description
          }
        });
        setSelectedOptions(initialSelectedOptions)
        setModalMessage(selectedOptionDescription)
      } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs :', error);
      }
    };
    fetchParams();
  }, [token]);

  const handleSelectChange = (settingName, selectedValue) => {
    setSelectedOptions(prev => ({ ...prev, [settingName]: selectedValue }));
  };

  const openModal = (description) => {
    setModalMessage(description);
    setShowInfoModal(true);
  };

  const closeModal = () => {
    setShowInfoModal(false);
  };

  return (
    <div>
      <div className="py-3.5 px-6 bg-flat-yellow mx-2.5 my-4 border-2 border-black shadow-flat-black">
        <p className="font-title uppercase text-xl font-black mb-4">Mode de match</p>
        <div className="flex flex-col justify-start">
          {settings.map((setting) => {
            switch (setting.id) {
              case '1':
                return <SettingFormSelect
                          setting={setting}
                          handleSelectChange={handleSelectChange}
                          selectedOptions={selectedOptions}
                          openModal={openModal}
                        />;
              case '2':
                return <SettingFormSelect
                  setting={setting}
                  handleSelectChange={handleSelectChange}
                  selectedOptions={selectedOptions}
                  openModal={openModal}
                />;
              default:
                return <SettingFormSelect
                  setting={setting}
                  handleSelectChange={handleSelectChange}
                  selectedOptions={selectedOptions}
                  openModal={openModal}
                />;
            }
          })}
        </div>
        {showInfoModal && <InformationModal message={modalMessage} closeModal={closeModal} />}
      </div>
    </div>
  );
}

export default Settings;
