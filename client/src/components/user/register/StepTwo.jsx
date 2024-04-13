import React, {useRef, useState} from 'react';
import arrowLeft from "../../../assets/icons/arrow-left.svg";
import defaultUserImage from "../../../assets/components/user/default-user-profile.png";
import blueOctogram from "../../../assets/components/register/blue-octogram.png";
import duodecimgram from "../../../assets/components/register/duodecimgram.png";
import eyes from "../../../assets/components/register/eyes.png";
import interrogationBlack from "../../../assets/components/register/interrogation-black.png";
import interrogationBlue from "../../../assets/components/register/interrogation-blue.png";
import yellowStar from "../../../assets/components/register/yellow-star.png";

const StepTwo = ({ onPrevious, onNext }) => {
  const [username, setUsername] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(defaultUserImage);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div
      className="step-two-container h-full relative z-[2] bg-cover bg-no-repeat bg-bottom flex flex-col justify-start py-16 px-8">
      <h2
        className={`
        text-center
            font-black 
            font-rubik 
            my-8 
            mt-0 
            relative 
            w-fit 
            mx-auto 
            text-xl6
            leading-[60px]
            `}>
        <span className="relative z-[3]">Complète ton profil</span>
        <span className="absolute inset-0 translate-x-1 translate-y-1 text-purple-soft z-[2]">Complète ton profil</span>
        <span className="absolute inset-0 translate-x-2 translate-y-2 text-green-soft z-[1]">Complète ton profil</span>
      </h2>
      <div
        className="block relative border-2 border-black w-full mx-auto bg-white rounded-xl py-12 overflow-hidden">
        <img src={blueOctogram} alt="" className="absolute top-0 right-0"/>
        <img src={interrogationBlack} alt="" className="absolute -rotate-[30deg] top-8 right-8"/>
        <div className="relative w-fit mx-auto">
          <img src={yellowStar} alt="" className="absolute -left-4 top-0"/>
          <p className="relative z-[2] font-rubik text-center font-black text-xl2">Qui es-tu ?</p>
        </div>
        <form
          className="flex flex-col items-center px-8"
          onSubmit={(e) => {
            e.preventDefault();
            onNext(username, profilePic);
          }}>
          <label htmlFor="text" className="my-4 w-full relative flex flex-row justify-start">
            <input
              type="text"
              value={username}
              className="py-2 px-1 w-5/6 mx-auto bg-white border border-black rounded-full text-center font-roboto text-base font-regular focus:outline-none placeholder:text-grey-soft"
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nom d'utilisateur"
              required
            />
          </label>
          <img src={interrogationBlack} alt="" className="absolute top-1/3 left-4"/>
          <img src={interrogationBlack} alt="" className="absolute -rotate-[7deg] top-2/3 right-4"/>
          <label htmlFor="file" className="my-4 w-full relative flex flex-col justify-center items-center">
            <div className="relative overflow-visible">
              <img src={blueOctogram} alt="" className="absolute w-[50px] bottom-0 -left-5"/>
              <img src={yellowStar} alt="" className="absolute z-[7] rotate-[5deg] bottom-4 left-1"/>
              <img src={duodecimgram} alt="" className="absolute z-[4] rotate-[5deg] -top-2 -right-2"/>
              <img src={interrogationBlue} alt="" className="absolute z-[8] rotate-[5deg] top-1 right-1"/>
              <img src={imagePreviewUrl} alt="Aperçu du profil" className="w-[150px] relative z-[6]"/>
            </div>
            <button type="button" onClick={handleButtonClick}
                    className="file-input-button mt-2 font-roboto text-sm font-regular text-grey-medium underline">
              Ajouter une photo
            </button>
            <input
              type="file"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
              required
            />
          </label>
          <div className="absolute left-2 top-2">
            <button
              className="relative block w-fit rounded-full mt-2 ml-2 before:content-[''] before:absolute before:z-[1] before:w-[30px] before:h-[30px] before:inset-0 before:rounded-full before:bg-black before:border-black before:border group"
              onClick={onPrevious}>
              <img
                className="relative z-[2] w-[30px] h-[30px] block border-2 border-black text-black uppercase font-regular text-l font-roboto px-1 py-1 rounded-full text-center shadow-md bg-white transition -translate-y-0.5 group-hover:-translate-y-0"
                src={arrowLeft} alt="Retour"/>
            </button>
          </div>
          <div className="absolute right-2 top-2">
            <button
              className="relative block w-fit rounded-full mt-2 ml-2 before:content-[''] before:absolute before:z-[1] before:w-[30px] before:h-[30px] before:inset-0 before:rounded-full before:bg-black before:border-black before:border group"
              type="submit" disabled={!username || !profilePic}>
              <img
                className="relative z-[2] w-[30px] h-[30px] rotate-180 block border-2 border-black text-black uppercase font-regular text-l font-roboto px-1 py-1 rounded-full text-center shadow-md bg-white transition -translate-y-0.5 group-hover:-translate-y-0"
                src={arrowLeft} alt="Suivant"/>
            </button>
          </div>
          <img src={eyes} alt="" className="absolute bottom-0 -left-2"/>
        </form>
      </div>
      <button
        className="w-4/5 relative mt-8 mx-auto before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-black before:border-black before:border group"
        disabled
      >
        <span
          className="relative z-[2] w-full block border border-black text-black uppercase font-regular text-l font-roboto px-3 py-2 rounded-full text-center shadow-md bg-grey-light transition -translate-y-1.5 group-hover:-translate-y-0">Inscription</span>
      </button>
    </div>
  );
};

export default StepTwo;
