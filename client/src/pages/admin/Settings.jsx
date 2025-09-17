import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {useCookies} from "react-cookie";
import InformationModal from "../../components/modals/InformationModal.jsx";
import DynamicFormComponent from "../../components/admin/DynamicFormComponent.jsx";
import SimpleTitle from "../../components/partials/SimpleTitle.jsx";
import BackButton from "../../components/nav/BackButton.jsx";
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

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
        const response = await axios.get(`${apiUrl}/api/admin/settings`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        const fetchedSettings = response.data
        setSettings(fetchedSettings)
        const initialSelectedOptions = {}
        const selectedOptionDescription = {}
        fetchedSettings.forEach(setting => {
          if (setting.options) {
            const selectedOptionKey = Object.keys(setting.options).find(key => setting.options[key] === setting.activeOption)
            if (selectedOptionKey) {
              initialSelectedOptions[setting.key] = selectedOptionKey
              selectedOptionDescription[setting.key] = setting.options[selectedOptionKey].description
            }
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

  const refreshData = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/admin/settings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      setSettings(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des paramètres :', error);
    }
  };

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
    <div className="inline-block relative z-20 w-full h-auto py-12 overflow-hidden">
      <BackButton />
      <SimpleTitle title={"Gestion des réglages"} stickyStatus={false} uppercase={true} fontSize={'2rem'} />
      {settings.map((setting) => (
        <DynamicFormComponent
          key={setting.id}
          setting={setting}
          openModal={openModal}
          onRefresh={refreshData}
        />
      ))}

      {showInfoModal && <InformationModal message={modalMessage} closeModal={closeModal} />}
    </div>
  );
}

export default Settings;
