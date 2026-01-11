import React, {useContext, useEffect, useState} from 'react';
import axios from "axios";
import { useCookies } from "react-cookie";
import SimpleTitle from "../components/partials/SimpleTitle.jsx";
import BackButton from "../components/nav/BackButton.jsx";
import ContributionForm from "../components/forms/ContributionForm.jsx";
import Modal from "../components/modals/Modal.jsx";
import defaultUserImage from "../assets/components/user/default-user-profile.png";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
  faCheck, faEuroSign,
  faSackDollar,
  faSackXmark, faTrash, faXmark
} from "@fortawesome/free-solid-svg-icons";
import {UserContext} from "../contexts/UserContext.jsx";
import monthPointsShape from "../assets/components/dashboard/month/month-points-shape.png";
import totalContribText from "../assets/components/contributions/total-cagnotte.webp";
import userLockIcon from "../assets/icons/lock.svg";
import userUnlockIcon from "../assets/icons/unlock.svg";
import BlockUsers from "../components/forms/BlockUsers.jsx";
import InformationModal from "../components/modals/InformationModal.jsx";
import AlertModal from "../components/modals/AlertModal.jsx";
import InlineCopy from "../components/buttons/InlineCopy.jsx";
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const Contributions = () => {
  const { user, isAuthenticated, hasTreasurerAccess, hasManagerAccess, hasTwiceAccess } = useContext(UserContext);
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
  const [isRibModalOpen, setIsRibModalOpen] = useState(false);

  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [selectedContribution, setSelectedContribution] = useState(null);

  const [userColors, setUserColors] = useState({});
  const colors = ['#6666FF', '#CC99FF', '#00CC99', '#F7B009', '#F41731'];

  const formatEUR = (n) => `${Math.round(Number(n) || 0)}`;

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

      const enriched = response.data.map(u => {
        const totalReceived = u.contributions.reduce((sum, c) => {
          // Ne pas compter les contributions payées avec golden ticket
          if (c.paid_with_golden_ticket) return sum;
          return sum + (c.status === 'received' ? (Number(c.amount) || 0) : 0);
        }, 0);
        return { ...u, totalReceived };
      });

      const sortedContributions = enriched.sort((a, b) => b.totalReceived - a.totalReceived);

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
        const response = await axios.patch(`${apiUrl}/api/user/${userId}/unlocked`, {
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
          matchday: data.matchday,
          amount: data.amount
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

  const openActionModal = (contrib, userId) => {
    if (!hasTreasurerAccess) return;
    setSelectedContribution({ contrib, userId });
    setIsActionModalOpen(true);
  };

  const totalContributions = contributions.reduce((sumUsers, u) => {
    return sumUsers + u.contributions.reduce((sum, c) => {
      // Ne pas compter les contributions payées avec golden ticket
      if (c.paid_with_golden_ticket) return sum;
      return sum + (c.status === 'received' ? (Number(c.amount) || 0) : 0);
    }, 0);
  }, 0);

  return (
    <div className="inline-block relative z-10 w-full h-auto py-20 overflow-x-hidden">
      <BackButton/>
      <SimpleTitle title={"Steps d'épargne"} stickyStatus={false}/>
      <button
        className="absolute z-[25] bg-orange-medium top-2 right-1/2 -translate-x-4 border-2 border-black w-[70px] text-center h-[40px] rounded-full flex flex-row justify-center items-center shadow-flat-black-adjust transition-shadow duration-300 ease-in-out hover:shadow-none"
        onClick={() => setIsRibModalOpen(true)}>
        <span className="font-rubik w-full font-black text-stroke-black-2 text-white text-[150%] -mt-0.5 inline-block leading-[35px]">RIB</span>
      </button>
      {hasTreasurerAccess && (
        <>
          <button
            className="absolute z-[25] bg-green-medium top-2 right-2 border-2 border-black w-[40px] text-center h-[40px] rounded-full flex flex-row justify-center items-center shadow-flat-black-adjust transition-shadow duration-300 ease-in-out hover:shadow-none"
            onClick={() => setIsModalOpen(true)}>
            <span className="font-rubik w-full font-black text-stroke-black-2 text-white text-[150%] -mt-0.5 inline-block leading-[35px]">+</span>
          </button>
        </>
      )}
      {hasTwiceAccess && (
        <>
          <button
            className="absolute z-[25] bg-red-light top-2 right-20 border-2 border-black w-[40px] p-1 text-center h-[40px] rounded-full flex flex-row justify-center items-center shadow-flat-black-adjust transition-shadow duration-300 ease-in-out hover:shadow-none"
            onClick={() => setIsModalBlockedOpen(true)}>
            <img className="w-full h-full object-contain object-center brightness-0" src={userLockIcon} alt=""/>
          </button>
          <button
            className="absolute z-[25] bg-blue-light top-2 right-32 border-2 border-black w-[40px] p-1 text-center h-[40px] rounded-full flex flex-row justify-center items-center shadow-flat-black-adjust transition-shadow duration-300 ease-in-out hover:shadow-none"
            onClick={() => setIsModalUnlockedOpen(true)}>
            <img className="w-full h-full object-contain object-center brightness-0" src={userUnlockIcon} alt=""/>
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
            {formatEUR(totalContributions)}
          </p>
        </div>
        <div>
          {bestContributor && (
            <div className="flex flex-col items-center justify-center relative">
              <h2 className="font-rubik text-base font-medium text-black uppercase text-center leading-5">Meilleur <br/>contributeur
              </h2>
              <p className="relative z-10 font-rubik text-xl3 -mt-2 -mb-8 text-center uppercase">
                <span className="text-stroke-black-2 font-black text-white">{bestContributor.user.username}</span>
              </p>
              <img
                className="object-center w-[150px] h-[150px] my-2 rounded-2xl shadow-flat-black object-cover border-l-2 border-t-2 border-b border-r border-black"
                src={bestContributor.user.img ? `${apiUrl}/uploads/users/${bestContributor.user.id}/${bestContributor.user.img}` : defaultUserImage}
                alt={bestContributor.user.username}
              />
              <p
                className="relative z-10 font-black font-rubik text-xl5 text-yellow-light leading-4 -mt-4">
                <span className="text-stroke-black-2">{formatEUR(bestContributor.totalReceived)}</span><span className="font-sans text-xl2 font-bold text-black absolute z-[5] -bottom-5 -right-3">€</span>
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="relative mt-28 px-4">
        <ul className="flex flex-row flex-wrap justify-between items-stretch">
          {contributions.map((contribution, index) => (
            <li
              className="w-[46%] my-4 border border-black bg-white border-l-2 border-t-2 shadow-flat-black rounded-xl"
              key={index}>
              {contribution.user ? (
                <div
                  className="relative flex flex-col justify-start items-center rounded-t-xl rounded-l-2xl bg-purple-light border-b border-black py-2 pl-10"
                  style={{backgroundColor: userColors[contribution.user.id] + "60"}}>
                  <img
                    className="object-center absolute -left-3.5 top-[-0.8rem] w-[60px] h-[60px] rounded-xl rounded-br-none object-cover border-l-2 border-t-2 border-b border-r border-black shadow-flat-black-adjust"
                    src={contribution.user.img ? `${apiUrl}/uploads/users/${contribution.user.id}/${contribution.user.img}` : defaultUserImage}
                    alt={contribution.user.username}/>
                  <p className="w-full text-center font-rubik text-base font-medium text-black leading-5">
                    {contribution.user.username}
                  </p>
                  <p className="w-full text-center font-rubik text-xxs font-regular text-black leading-3">
                    Total reçu : {formatEUR(contribution.totalReceived)}€
                  </p>
                </div>
              ) : (
                <p className="font-sans text-sm font-medium text-red-500">
                  Utilisateur non défini
                </p>
              )}
              <ul className="py-2 px-1">
                {contribution.contributions.map((contrib, index) => {

                  const rowInteractive =
                    hasTreasurerAccess ? 'cursor-pointer hover:bg-black/5 active:scale-[0.995] transition-all duration-300 hover:shadow-none focus:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 focus:translate-x-0.5 focus:translate-y-0.5' : '';

                  // Fond jaune si payé avec golden ticket
                  const bgColor = contrib.paid_with_golden_ticket
                    ? '#FFD700'
                    : userColors[contribution.user.id] + "20";

                  return (
                    <li
                      className={`flex flex-row justify-between shadow-flat-black-adjust border border-black relative my-2 rounded-md px-1 py-1 ${rowInteractive}`}
                      style={{backgroundColor: bgColor}}
                      key={index}
                      onClick={() => openActionModal(contrib, contribution.user.id)}
                      aria-disabled={!hasTreasurerAccess}
                    >
                      <p
                        className="font-sans text-xs font-regular text-black">
                        {contrib.matchday === 0 ? 'Adhésion' : 'Journée ' + contrib.matchday}
                        {contrib.paid_with_golden_ticket && <span className="ml-1" title="Payé avec Golden Ticket">🎟️</span>}
                      </p>
                      <p className="font-sans text-xs font-semibold text-black">
                        {contrib.paid_with_golden_ticket ? '0' : formatEUR(contrib.amount)}€
                      </p>
                      <p className="font-sans text-base font-medium text-black">
                        {contrib.status === 'pending' ? (
                          <span className="text-center flex flex-row justify-center items-center">
                            <FontAwesomeIcon icon={faSackXmark}
                                             className="font-rubik w-full font-black text-red-medium text-sm inline-block"/>
                          </span>
                        ) : (
                          <span className="text-center flex flex-row justify-center items-center">
                            <FontAwesomeIcon icon={faSackDollar}
                                             className="font-rubik w-full font-black text-green-soft text-sm inline-block"/>
                          </span>
                        )}
                      </p>
                    </li>
                  )
                })}
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
      <Modal isOpen={isRibModalOpen} onClose={() => setIsRibModalOpen(false)}>
        <div>
          <p className="text-center font-rubik text-base font-medium text-black mb-6">RIB Steps d'épargne</p>
          <InlineCopy
            label="IBAN"
            value="FR76 1759 8000 0100 0190 2206 106"
          />
          <InlineCopy
            label="BIC"
            value="LYDIFRP2XXX"
          />
        </div>
      </Modal>
      <Modal isOpen={isActionModalOpen} onClose={() => setIsActionModalOpen(false)}>
        {selectedContribution && (
          <div className="p-2">
            <h3 className="font-sans text-l leading-5 font-black uppercase mb-2">Action sur la contribution</h3>
            <p className="text-sm mb-4">
              <b>{selectedContribution.contrib.matchday === 0 ? 'Adhésion' : 'Journée ' + selectedContribution.contrib.matchday}</b> — Montant&nbsp;
              <b>{selectedContribution.contrib.paid_with_golden_ticket ? '0' : formatEUR(selectedContribution.contrib.amount)}€</b><br/>
              Statut actuel&nbsp;: <b>{selectedContribution.contrib.status === 'pending' ? 'En attente' : 'Reçue'}</b>
              {selectedContribution.contrib.paid_with_golden_ticket && (
                <><br/><span className="text-yellow-600 font-bold">🎟️ Payé avec Golden Ticket (annulée)</span></>
              )}
            </p>

            <div className="flex flex-col gap-2">
              {!selectedContribution.contrib.paid_with_golden_ticket ? (
                <>
                  {/* Affiche Valider si en attente */}
                  {selectedContribution.contrib.status === 'pending' && (
                    <button
                      className="w-full uppercase bg-green-medium text-black border-2 border-black rounded-lg py-2 font-sans font-regular shadow-flat-black-adjust hover:shadow-none"
                      onClick={async () => {
                        await handleValidateContribution(selectedContribution.contrib.id, selectedContribution.userId);
                        setIsActionModalOpen(false);
                        setSelectedContribution(null);
                      }}
                    >
                      <FontAwesomeIcon icon={faCheck} className="mr-2"/> Valider (reçue)
                    </button>
                  )}

                  {/* Affiche Repasser en attente si reçue */}
                  {selectedContribution.contrib.status === 'received' && (
                    <button
                      className="w-full uppercase bg-yellow-300 text-black border-2 border-black rounded-lg py-2 font-sans font-black shadow-flat-black-adjust hover:shadow-none"
                      onClick={async () => {
                        await handlePendingContribution(selectedContribution.contrib.id, selectedContribution.userId);
                        setIsActionModalOpen(false);
                        setSelectedContribution(null);
                      }}
                    >
                      <FontAwesomeIcon icon={faSackXmark} className="mr-2"/> Repasser en attente
                    </button>
                  )}

                  {/* Supprimer toujours disponible pour admin/treasurer */}
                  {hasTreasurerAccess && (
                    <button
                      className="w-full uppercase bg-red-light text-black border-2 border-black rounded-lg py-2 font-sans font-black shadow-flat-black-adjust hover:shadow-none"
                      onClick={async () => {
                        await handleDeleteContribution(selectedContribution.contrib.id, selectedContribution.userId);
                        setIsActionModalOpen(false);
                        setSelectedContribution(null);
                      }}
                    >
                      <FontAwesomeIcon icon={faTrash} className="mr-2"/> Supprimer
                    </button>
                  )}
                </>
              ) : (
                <p className="text-sm text-center text-gray-600 italic">
                  Cette contribution a été annulée avec un Golden Ticket. Aucune action possible.
                </p>
              )}

              <button
                className="w-full bg-gray-200 text-black border-2 border-black rounded-lg py-2 font-sans uppercase font-black shadow-flat-black-adjust hover:shadow-none"
                onClick={() => {
                  setIsActionModalOpen(false);
                  setSelectedContribution(null);
                }}
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </Modal>
      <AlertModal message={alertMessage} type={alertType} />
    </div>
  )

}

export default Contributions