import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {useCookies} from "react-cookie";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircleQuestion, faCircleXmark, faPaperPlane, faPen} from "@fortawesome/free-solid-svg-icons";
import InformationModal from "../../components/partials/InformationModal.jsx";

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
    <div className="py-3.5 px-6 bg-flat-yellow mx-2.5 my-4 border-2 border-black shadow-flat-black">
      <ul className="flex flex-col justify-start">
        {settings.map((setting) => (
          <li key={setting.id} className="flex flex-col items-center relative">
            <p className="font-title uppercase text-xl font-black mb-4">Mode de match</p>
            <form action="" className="w-full">
              <select
                name={setting.key}
                id={setting.key}
                className="w-full py-2 px-4 font-sans text-sm uppercase border-2 border-black shadow-flat-black"
                onChange={(e) => handleSelectChange(setting.key, e.target.value)}
                value={selectedOptions[setting.key]}
              >
                {Object.entries(setting.options).map(([key, option]) => {
                  return (
                    <option key={key} value={key}>{option.title}</option>
                  )
                })}
              </select>
              <button
                className="relative mt-8 mx-auto block h-fit before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-md before:bg-green-lime before:border-black before:border-2 group"
                type="submit"
              >
                <span className="relative z-[2] w-full flex flex-row justify-center border-2 border-black text-black px-4 py-1.5 rounded-md text-center font-sans uppercase font-bold shadow-md bg-white transition -translate-y-1 -translate-x-1 group-hover:-translate-y-0 group-hover:-translate-x-0">
                  Enregistrer
                </span>
              </button>
            </form>
            <button
              onClick={() => openModal(setting.description)}
              className="absolute mx-auto block top-0 right-0 h-fit before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-green-lime before:border-black before:border-2 group"
            >
              <span className="relative z-[2] w-full flex flex-row justify-center border-2 border-black text-black px-2 py-1.5 rounded-full text-center font-sans uppercase font-bold shadow-md bg-white transition -translate-y-1 -translate-x-0.5 group-hover:-translate-y-0 group-hover:-translate-x-0">
                <FontAwesomeIcon icon={faCircleQuestion} className="cursor-pointer" />
              </span>
            </button>
          </li>
        ))}
      </ul>
      {showInfoModal && <InformationModal message={modalMessage} closeModal={closeModal} />}
    </div>
  );
}

export default Settings;
