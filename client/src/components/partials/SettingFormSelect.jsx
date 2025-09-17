// SettingFormSelect.jsx
import React, {useEffect, useState} from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleQuestion } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const SettingFormSelect = ({ setting, openModal, token }) => {
  const [selectedOption, setSelectedOption] = useState(setting.active_option);

  const handleChange = (settingName, selectedValue) => {
    setSelectedOption(selectedValue)
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateSetting(setting.id, selectedOption);
      setSelectedOption(selectedOption)
    } catch (error) {
      console.error('Erreur lors de la mise à jour du réglage :', error);
    }
  };

  // Exemple d'une fonction utilitaire
  const updateSetting = async (settingId) => {
    try{
      const response = await axios.put(`${apiUrl}/api/admin/setting/update/${settingId}`, { newValue: selectedOption }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.data;
      if (response.status === 200) {
        console.log("Reglage mis à jour avec succès :", result);
      } else {
        console.error("Erreur lors de la mise à jour de du réglage :", result.error);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du réglage : ', error);
    }
  };

  return (
    <div className="py-3.5 px-6 bg-yellow-medium mx-2.5 my-4 border border-black rounded-xl shadow-flat-black">
      <div className="flex flex-col justify-start">
        <div key={setting.id} className="flex flex-col items-center relative">
          <p className="font-roboto uppercase text-xl font-black mb-4">{setting.display_name}</p>
          <form action="" className="w-full">
            <select
              name={setting.key}
              id={setting.key}
              translate="no"
              className="w-full py-2 px-4 font-rubik text-black text-sm uppercase border border-black shadow-flat-black"
              onChange={(e) => handleChange(setting.key, e.target.value)}
              value={selectedOption}
            >
              {Object.entries(setting.options).map(([key, option]) => (
                <option key={key} value={option.value}>{option.title}</option>
              ))}
            </select>
            <button
              translate="no"
              className="relative mt-8 mx-auto block h-fit before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-green-lime before:border-black before:border group"
              type="submit"
              onClick={handleSubmit}
            >
              <span translate="no" className="relative z-[2] w-full flex flex-row justify-center border border-black text-black px-4 py-1.5 rounded-full text-center font-sans uppercase font-bold shadow-md bg-white transition -translate-y-1 -translate-x-0.5 group-hover:-translate-y-0 group-hover:-translate-x-0">
                Enregistrer
              </span>
            </button>
          </form>
          <button
            translate="no"
            onClick={() => openModal(setting.description)}
            className="absolute mx-auto block top-0 -right-4 h-8 w-8 before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-green-lime before:border-black before:border group"
          >
            <span translate="no" className="relative z-[2] h-8 w-8 flex flex-row justify-center items-center border border-black text-black rounded-full text-center font-sans uppercase font-bold shadow-md bg-white transition -translate-y-1 -translate-x-0.5 group-hover:-translate-y-0 group-hover:-translate-x-0">
              <FontAwesomeIcon icon={faCircleQuestion} className="cursor-pointer" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingFormSelect;
