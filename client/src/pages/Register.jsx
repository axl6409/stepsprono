import React, { useContext, useState } from 'react';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { UserContext } from "../contexts/UserContext.jsx";
import StepOne from "../components/user/register/StepOne.jsx";
import StepTwo from "../components/user/register/StepTwo.jsx";
import StepThree from "../components/user/register/StepThree.jsx";
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const Register = () => {
  const [cookies, setCookie] = useCookies(["user"]);
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState({
    email: '',
    password: '',
    username: '',
    profilePic: null,
    teamId: ''
  });
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated, setIsAuthenticated } = useContext(UserContext);

  const goToNextStep = (data) => {
    setUserData({...userData, ...data});
    setStep(step + 1);
  };

  const goToPreviousStep = () => {
    setStep(step - 1);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <StepOne onNext={(email, password) => goToNextStep({email, password})} />;
      case 2:
        return <StepTwo onPrevious={goToPreviousStep} onNext={(username, profilePic) => goToNextStep({username, profilePic})} />;
      case 3:
        return <StepThree userData={userData} onPrevious={goToPreviousStep} onFinish={(team) => handleFinish({team})} />;
      default:
        return <StepOne onNext={(email, password) => goToNextStep({email, password})} />;
    }
  };

  const handleFinish = async (data) => {
    try {
      const formData = new FormData();
      formData.append('email', userData.email);
      formData.append('password', userData.password);
      formData.append('username', userData.username);
      if (userData.teamId) {
        formData.append('teamId', userData.teamId);
      }
      if (userData.profilePic) {
        formData.append('profilePic', userData.profilePic);
      }
      const response = await axios.post(`${apiUrl}/api/register`, formData);
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        setCookie('token', response.data.token, { path: '/' });
        setIsAuthenticated(true);
        navigate('/reglement');
      } else {
        console.error('Token is missing in response', response.data);
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        setErrorMessage(error.response.data.error);
      } else {
        setErrorMessage('Une erreur s’est produite: ' + error);
      }
    }
  };

  return (
    <div className="register-container w-full h-100vh">
      {renderStep()}
    </div>
  );
};

export default Register;
