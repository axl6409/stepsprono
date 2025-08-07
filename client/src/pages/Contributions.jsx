import React, {useContext, useEffect, useState} from 'react';
import axios from "axios";
import { useCookies } from "react-cookie";
import SimpleTitle from "../components/partials/SimpleTitle.jsx";
import BackButton from "../components/nav/BackButton.jsx";
import ContributionForm from "../components/partials/forms/ContributionForm.jsx";
import Modal from "../components/partials/modals/Modal.jsx";
import defaultUserImage from "../assets/components/user/default-user-profile.png";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faSackDollar,
  faSackXmark, faTrash, faXmark
} from "@fortawesome/free-solid-svg-icons";
import {UserContext} from "../contexts/UserContext.jsx";
import monthPointsShape from "../assets/components/dashboard/month/month-points-shape.png";
import totalContribText from "../assets/components/contributions/total-cagnotte.webp";
import userLockIcon from "../assets/icons/lock.svg";
import userUnlockIcon from "../assets/icons/unlock.svg";
import BlockUsers from "../components/partials/forms/BlockUsers.jsx";
import InformationModal from "../components/partials/modals/InformationModal.jsx";
import AlertModal from "../components/partials/modals/AlertModal.jsx";
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const Contributions = () => {
  const { user, isAuthenticated } = useContext(UserContext);
  const [cookies] = useCookies(['token']);
  const token = localStorage.getItem('token') || cookies.token;
  const [isLoading, setIsLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState(null);
  const [contributions, setContributions] = useState([]);
  const [bestContributor, setBestContributor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalBlockedOpen, setIsModalBlockedOpen] = useState(false);
  const [isModalUnlockedOpen, setIsModalUnlockedOpen] = useState(false);
  const [userColors, setUserColors] = useState({});
  const colors = ['#6666FF', '#CC99FF', '#00CC99', '#F7B009', '#F41731'];

  useEffect(() => {
    fetchContributions();
  }, [])

  const fetchContributions = async () => {
    try {
      setIsLoading(true)
      const response = await axios.get(`${apiUrl}/api/contributions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const sortedContributions = response.data.sort((a, b) => {
        return b.contributions.length - a.contributions.length;
      });

      setContributions(sortedContributions);

      const newUserColors = {};
      sortedContributions.forEach((contrib, index) => {
        newUserColors[contrib.user.id] = colors[index % colors.length];
      });
      setUserColors(newUserColors);

      if (sortedContributions.length > 0) {
        setBestContributor(sortedContributions[0]);
      }
    } catch (error) {
      console.error('Error fetching contributions:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleBlockUser = async (data) => {
    try {
      const promises = data.userId.map(async (userId) => {
        const response = await axios.patch(`${apiUrl}/api/user/${userId}/blocked`, {
          id: data.userId
        }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        return response.data;
      });

      const results = await Promise.all(promises);

      if (results) {
        setAlertType('success');
        setAlertMessage('Utilisateur bloqué avec succès !');
        setTimeout( () => { setAlertMessage('') }, 2000);
        window.location.reload();
      } else {
        setAlertType('error');
        setAlertMessage('Erreur lors du blocage de l\'utilisateur.');
        setTimeout( () => { setAlertMessage('') }, 2000);
      }

      setIsModalOpen(false);
    } catch (error) {
      console.error('Erreur lors du blocage de l\'utilisateur :', error);
      setAlertType(error);
      setAlertMessage('Erreur lors du blocage : ' + error.message);
      setTimeout( () => { setAlertMessage('') }, 2000);
    }
  };

  const handleUnlockUser = async (data) => {
    try {
      const promises = data.userId.map(async (userId) => {
        const response = await axios.patch(`${apiUrl}/api/user/${userId}/accepted`, {
          id: data.userId
        }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        return response.data;
      });

      const results = await Promise.all(promises);

      if (results) {
        setAlertType('success');
        setAlertMessage('Utilisateur débloqué avec succès !');
        setTimeout( () => { setAlertMessage('') }, 2000);
        window.location.reload();
      } else {
        setAlertType('error');
        setAlertMessage('Erreur lors du déblocage de l\'utilisateur.');
        setTimeout( () => { setAlertMessage('') }, 2000);
      }

      setIsModalOpen(false);
    } catch (error) {
      console.error('Erreur lors du déblocage de l\'utilisateur :', error);
      setAlertType(error);
      setAlertMessage('Erreur lors du déblocage : ' + error.message);
      setTimeout( () => { setAlertMessage('') }, 2000);
    }
  };

  const handleAddContribution = async (data) => {
    try {
      const promises = data.userId.map(async (userId) => {
        const response = await axios.post(`${apiUrl}/api/contribution/new/${userId}`, {
          matchday: data.matchday
        }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        return response.data;
      });

      const results = await Promise.all(promises);

      if (results) {
        setAlertType(true);
        setAlertMessage('Contribution ajoutée avec succès !');
        setTimeout( () => { setAlertMessage('') }, 2000);
        await fetchContributions();
      } else {
        setAlertType(false);
        setAlertMessage('Erreur lors de l\'ajout de la contribution.');
        setTimeout( () => { setAlertMessage('') }, 2000);
      }

      setIsModalOpen(false);
    } catch (error) {
      console.error('Erreur lors de la création des contributions:', error);
      setAlertType(false);
      setAlertMessage('Erreur lors de la création des contributions : ' + error.message);
      setTimeout( () => { setAlertMessage('') }, 2000);
    }
  };

  const handleValidateContribution = async (contributionId, userId) => {
    try {
      const response = await axios.patch(`${apiUrl}/api/contribution/received`, {
        id: contributionId,
        userId: userId
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 200) {
        setAlertType(true);
        setAlertMessage('Contribution validée avec succès !');
        setTimeout( () => { setAlertMessage('') }, 2000);
        await fetchContributions();
      }
    } catch (error) {
      console.error('Erreur lors de la validation de la contribution :', error);
      setAlertType(false);
      setAlertMessage('Erreur lors de la validation : ' + error.message);
      setTimeout( () => { setAlertMessage('') }, 2000);
    }
  };

  const handlePendingContribution = async (contributionId, userId) => {
    try {
      const response = await axios.patch(`${apiUrl}/api/contribution/pending`, {
        id: contributionId,
        userId: userId
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 200) {
        setAlertType(true);
        setAlertMessage('Contribution passée en attente avec succès !');
        setTimeout( () => { setAlertMessage('') }, 2000);
        await fetchContributions();
      }
    } catch (error) {
      console.error('Erreur lors du passage en attente de la contribution :', error);
      setAlertType(false);
      setAlertMessage('Erreur lors du passage en attente : ' + error.message);
      setTimeout( () => { setAlertMessage('') }, 2000);
    }
  };

  const handleDeleteContribution = async (contributionId, userId) => {
    try {
      const response = await axios.delete(`${apiUrl}/api/contribution/delete`, {
        headers: { 'Authorization': `Bearer ${token}` },
        data: { contributionId: contributionId, userId: userId }
      });

      if (response.status === 200) {
        setAlertType(true);
        setAlertMessage('Contribution supprimée avec succès !');
        setTimeout( () => { setAlertMessage('') }, 2000);
        await fetchContributions();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la contribution :', error);
      setAlertType(false);
      setAlertMessage('Erreur lors de la suppression : ' + error.message);
      setTimeout( () => { setAlertMessage('') }, 2000);
    }
  };

  const totalContributions = contributions.reduce((total, contribution) => {
    return total + contribution.contributions.length;
  }, 0);

  return (
    <div className="inline-block relative z-10 w-full h-auto py-20 overflow-x-hidden">
      <BackButton/>
      <SimpleTitle title={"Steps d'épargne"} stickyStatus={false}/>
      {(user.role === 'admin' || user.role === 'treasurer') && (
        <>
          <button
            className="absolute z-[25] bg-green-medium top-2 right-2 border-2 border-black w-[40px] text-center h-[40px] rounded-full flex flex-row justify-center items-center shadow-flat-black-adjust transition-shadow duration-300 ease-in-out hover:shadow-none"
            onClick={() => setIsModalOpen(true)}>
            <span className="font-rubik w-full font-black text-stroke-black-2 text-white text-[150%] -mt-0.5 inline-block leading-[35px]">+</span>
          </button>
          <button
            className="absolute z-[25] bg-red-medium top-2 right-20 border-2 border-black w-[40px] p-1 text-center h-[40px] rounded-full flex flex-row justify-center items-center shadow-flat-black-adjust transition-shadow duration-300 ease-in-out hover:shadow-none"
            onClick={() => setIsModalBlockedOpen(true)}>
            <img className="w-full h-full object-contain object-center" src={userLockIcon} alt=""/>
          </button>
          <button
            className="absolute z-[25] bg-blue-medium top-2 right-32 border-2 border-black w-[40px] p-1 text-center h-[40px] rounded-full flex flex-row justify-center items-center shadow-flat-black-adjust transition-shadow duration-300 ease-in-out hover:shadow-none"
            onClick={() => setIsModalUnlockedOpen(true)}>
            <img className="w-full h-full object-contain object-center" src={userUnlockIcon} alt=""/>
          </button>
        </>
      )}
      <div className="mb-4 flex flex-row justify-evenly items-center">
        <div
          className="h-fit flex flex-col w-1/3 p-1 relative fade-in">
          <div className="w-full relative">
            <img className="block" src={monthPointsShape} alt=""/>
            <img className="absolute inset-0 rotate-animation delay-500 origin-center" src={totalContribText} alt=""/>
          </div>
          <p
            translate="no"
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-rubik text-xl4 stroke-black font-black text-white leading-7">
            {totalContributions}0
          </p>
        </div>
        <div>
          {bestContributor && (
            <div className="flex flex-col items-center justify-center relative">
              <h2 className="font-rubik text-base font-medium text-black uppercase text-center leading-5">Meilleur <br/>contributeur
              </h2>
              <img
                className="object-center w-[150px] h-[150px] my-2 rounded-full object-cover border-l-2 border-t-2 border-b border-r border-black"
                src={bestContributor.user.img ? `${apiUrl}/uploads/users/${bestContributor.user.id}/${bestContributor.user.img}` : defaultUserImage}
                alt={bestContributor.user.username}
              />
              <p className="font-rubik text-xl2 -mt-8 font-black text-center uppercase text-stroke-black-2 text-white">
                {bestContributor.user.username}
              </p>
              <p
                className="absolute top-6 left-14 font-black font-rubik text-xl5 text-yellow-light text-stroke-black-2">
                {bestContributor.contributions.length}
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="relative mt-28 px-4">
        <ul className="flex flex-row flex-wrap justify-between items-stretch">
          {contributions.map((contribution, index) => (
            <li
              className="w-[46%] my-4 border border-black border-l-2 border-t-2 shadow-flat-black-adjust rounded-xl"
              key={index}>
              {contribution.user ? (
                <div
                  className="relative flex flex-row justify-start items-center rounded-t-xl rounded-l-2xl bg-purple-light border-b border-black py-2 pl-10"
                  style={{backgroundColor: userColors[contribution.user.id] + "60"}}>
                <img
                    className="object-center absolute -left-3.5 -top-3.5 w-[60px] h-[60px] rounded-full object-cover border-l-2 border-t-2 border-b border-r border-black"
                    src={contribution.user.img ? `${apiUrl}/uploads/users/${contribution.user.id}/${contribution.user.img}` : defaultUserImage}
                    alt={contribution.user.username}/>
                  <p className="w-full text-center font-rubik text-base font-medium text-black">
                    {contribution.user.username}
                  </p>
                </div>
              ) : (
                <p className="font-sans text-sm font-medium text-red-500">
                  Utilisateur non défini
                </p>
              )}
              <ul className="p-5">
                {contribution.contributions.map((contrib, index) => (
                  <li
                    className="flex flex-row justify-between relative my-2"
                    key={index}>
                    {(user.role === 'admin' || user.role === 'treasurer') && (
                      <button
                        className="absolute -left-8 z-[25] bg-white border border-black w-[23px] text-center h-[23px] rounded-full flex flex-row justify-center items-center shadow-flat-black-adjust transition-shadow duration-300 ease-in-out hover:shadow-none"
                        onClick={() => handleDeleteContribution(contrib.id, contribution.user.id)}>
                        <span className="font-rubik w-full font-black text-black text-xs inline-block">
                          <FontAwesomeIcon icon={faTrash}/>
                        </span>
                      </button>
                    )}
                    <p
                      className="font-sans text-sm font-medium text-black mr-4">
                      Journée {contrib.matchday}
                    </p>
                    <p className="font-sans text-base font-medium text-black">
                      {contrib.status === 'pending' ? (
                        <span className="text-center flex flex-row justify-center items-center">
                          <FontAwesomeIcon icon={faSackXmark}
                                           className="font-rubik w-full font-black text-red-medium text-l inline-block"/>
                        </span>
                      ) : (
                        <span className="text-center flex flex-row justify-center items-center">
                          <FontAwesomeIcon icon={faSackDollar}
                                           className="font-rubik w-full font-black text-green-soft text-l inline-block"/>
                        </span>
                      )}
                    </p>
                    {(user.role === 'admin' || user.role === 'treasurer') && contrib.status === 'pending' && (
                      <button
                        className="absolute -right-7 z-[25] bg-white border border-black w-[23px] text-center h-[23px] rounded-full flex flex-row justify-center items-center shadow-flat-black-adjust transition-shadow duration-300 ease-in-out hover:shadow-none"
                        onClick={() => handleValidateContribution(contrib.id, contribution.user.id)}>
                        <span className="font-rubik w-full font-black text-black text-xs inline-block">
                          <FontAwesomeIcon icon={faCheck}/>
                        </span>
                      </button>
                    )}
                    {(user.role === 'admin' || user.role === 'treasurer') && contrib.status === 'received' && (
                      <button
                        className="absolute -right-7 z-[25] bg-white border border-black w-[23px] text-center h-[23px] rounded-full flex flex-row justify-center items-center shadow-flat-black-adjust transition-shadow duration-300 ease-in-out hover:shadow-none"
                        onClick={() => handlePendingContribution(contrib.id, contribution.user.id)}>
                        <span className="font-rubik w-full font-black text-black text-xs inline-block">
                          <FontAwesomeIcon icon={faXmark}/>
                        </span>
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ContributionForm
          onSubmit={handleAddContribution}
          onClose={() => setIsModalOpen(false)}
        />
      </Modal>
      <Modal isOpen={isModalBlockedOpen} onClose={() => setIsModalBlockedOpen(false)}>
        <BlockUsers
          onSubmit={handleBlockUser}
          onClose={() => setIsModalOpen(false)}
          blocked={true}
        />
      </Modal>
      <Modal isOpen={isModalUnlockedOpen} onClose={() => setIsModalUnlockedOpen(false)}>
        <BlockUsers
          onSubmit={handleUnlockUser}
          onClose={() => setIsModalOpen(false)}
          blocked={false}
        />
      </Modal>

      <AlertModal message={alertMessage} type={alertType} />
    </div>
  )

}

export default Contributions