import React, { useRef } from 'react';
import navClose from '../../../assets/icons/nav-cross.svg';

const RewardPopup = ({ reward, apiUrl, onClose }) => {
  const popupRef = useRef();

  const handleClickOutside = (event) => {
    if (popupRef.current && !popupRef.current.contains(event.target)) {
      onClose();
    }
  };

  const getRankClass = (rank) => {
    switch (rank.toLowerCase()) {
      case 'bronze':
        return 'trophy-bronze-rank-text';
      case 'silver':
        return 'trophy-silver-rank-text';
      case 'gold':
        return 'trophy-gold-rank-text';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 fade-in delay-1000 flex items-center justify-center bg-black bg-opacity-50 z-50" onClick={handleClickOutside}>
      <div ref={popupRef} className="bg-white w-11/12 py-4 px-4 rounded shadow-lg relative">
        <button
          onClick={onClose}
          className="swiper-button-prev fade-in w-[40px] h-[40px] rounded-full bg-white top-7 right-2 left-[inherit] shadow-flat-black-adjust border-2 border-black transition-all duration-300 hover:shadow-none focus:shadow-none"
        >
          <img src={navClose} alt="Icône flèche"/>
        </button>
        <div className="rounded-[18px] mb-6 relative overflow-hidden p-2">
          <div className={`trophy-${reward.rank.toLowerCase()}-gradient w-full h-full absolute inset-0 z-[1] rounded-[18px] delay-500 origin-center`}></div>
          <div className="bg-grey-light relative z-[3] border-8 py-3 border-white rounded-[12px]">
            <div className="w-[200px] h-[200px] mx-auto flex flex-col justify-center relative">
              <img src={`${apiUrl}/uploads/trophies/${reward.id}/${reward.image}`} alt={reward.name}
                   className="mx-auto w-[75%]"/>
              <img src={`${apiUrl}/uploads/trophies/${reward.id}/text_${reward.id}.webp`} alt={reward.name}
                   className="h-full w-full object-contain object-center absolute inset-0 rotate-animation delay-500 origin-center"/>
            </div>
          </div>
        </div>
        <p translate="no" className="font-roboto font-medium text-sm leading-5">{reward.description}</p>
        <p translate="no" className={`font-rubik uppercase mt-4 text-sm font-bold ${getRankClass(reward.rank)} leading-5`}>{reward.rank}</p>
      </div>
    </div>
  );
};

export default RewardPopup;