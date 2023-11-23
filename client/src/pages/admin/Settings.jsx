import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {useCookies} from "react-cookie";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCaretLeft, faCircleQuestion, faCircleXmark, faPaperPlane, faPen} from "@fortawesome/free-solid-svg-icons";
import InformationModal from "../../components/partials/InformationModal.jsx";
import DynamicFormComponent from "../../components/admin/DynamicFormComponent.jsx";
import {Link} from "react-router-dom";

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
      const response = await axios.get('http://127.0.0.1:3001/api/admin/settings', {
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

  const openModal = (id, description) => {
    setModalMessage(description);
    setModalId(id);
    setShowInfoModal(true);
  };

  const closeModal = () => {
    setShowInfoModal(false);
  };

  return (
    <div>
      <Link
        to="/admin"
        className="w-fit block relative my-4 ml-4 before:content-[''] before:inline-block before:absolute before:z-[-1] before:inset-0 before:bg-green-lime before:border-black before:border-2 group"
      >
        <span className="relative z-[2] w-full block border-2 border-black text-black px-3 py-1 text-center shadow-md bg-white transition -translate-y-1 translate-x-1 group-hover:-translate-y-0 group-hover:-translate-x-0">
          <FontAwesomeIcon icon={faCaretLeft} />
        </span>
      </Link>
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
