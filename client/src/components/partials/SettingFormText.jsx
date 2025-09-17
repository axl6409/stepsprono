// SettingFormSelect.jsx
import React, {useEffect, useRef, useState} from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleQuestion } from "@fortawesome/free-solid-svg-icons";
import {Editor} from "@tinymce/tinymce-react";
import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const SettingFormText = ({ setting, openModal, token, }) => {
  const editorRef = useRef(setting.options['Value'])
  const apiKey = import.meta.env.VITE_TINYMCE_API_KEY;

  const handleEditorChange = (content) => {
    editorRef.current = content;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const content = editorRef.current;
    if (editorRef.current) {
      const content = editorRef.current;
      try {
        await updateSetting(setting.id, content);
      } catch (error) {
        console.error('Erreur lors de la mise à jour du réglage :', error);
      }
    }
  };

  const updateSetting = async (settingId, content) => {
    try{
      const response = await axios.put(`${apiUrl}/api/admin/setting/update/${settingId}`, { newValue: content }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.data;
      if (response.status === 200) {
        console.log("Réglage mis à jour avec succès :", result);
      } else {
        console.error("Erreur lors de la mise à jour de du réglage :", result.error);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du réglage : ', error);
    }
  };

  return (
    <div className="py-3.5 px-2 bg-yellow-medium mx-2.5 my-4 border border-black rounded-xl shadow-flat-black">
      <div className="flex flex-col justify-start">
        <div key={setting.id} className="flex flex-col items-center relative">
          <p translate="no" className="font-roboto uppercase text-xl font-black mb-4">{setting.display_name}</p>
          <form action="" className="w-full">
            <Editor
              apiKey={apiKey}
              init={{
                plugins: 'anchor autolink charmap codesample emoticons link lists visualblocks',
                toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat',
                skin: (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'oxide-dark' : 'oxide'),
                content_css: (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'default')
              }}
              initialValue={setting.options['Value']}
              onEditorChange={handleEditorChange}
            />
            <button
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
            onClick={() => openModal(setting.description)}
            className="absolute mx-auto block top-0 right-0 h-8 w-8 before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-green-lime before:border-black before:border group"
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

export default SettingFormText;
