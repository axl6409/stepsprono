import React, { useRef } from 'react';

const RewardPopup = ({ reward, apiUrl, onClose }) => {
  const popupRef = useRef();

  const handleClickOutside = (event) => {
    if (popupRef.current && !popupRef.current.contains(event.target)) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50" onClick={handleClickOutside}>
      <div ref={popupRef} className="bg-white w-11/12 p-8 rounded shadow-lg relative">
        <button className="absolute top-2 right-2" onClick={onClose}>✕</button>
        <h2 className="text-2xl font-bold mb-4">{reward.name}</h2>
        <img src={`${apiUrl}/uploads/trophies/${reward.image}`} alt={reward.name} className="w-[200px] mx-auto mb-4"/>
        <p>{reward.description}</p>
      </div>
    </div>
  );
};

export default RewardPopup;