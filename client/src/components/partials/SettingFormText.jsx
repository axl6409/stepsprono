// SettingFormSelect.jsx
import React, {useEffect, useRef} from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleQuestion } from "@fortawesome/free-solid-svg-icons";
import {Editor} from "@tinymce/tinymce-react";

const SettingFormText = ({ setting, handleSelectChange, selectedOptions, openModal }) => {
  const editorRef = useRef(null);
  const apiKey = import.meta.env.VITE_TINYMCE_API_KEY;

  useEffect(() => {

  }, []);

  const updateSetting = async () => {

  }

  return (
    <div key={setting.id} className="flex flex-col items-center relative">
      <p className="font-title uppercase text-xl font-black mb-4">{setting.displayName}</p>
      <form action="" className="w-full">
        <Editor
          apiKey={apiKey}
          init={{
            plugins: 'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount',
            toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat',
          }}
          initialValue={setting.description}
        />
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
    </div>
  );
};

export default SettingFormText;
