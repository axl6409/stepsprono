import React, {useContext, useEffect, useState} from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowsRotate, faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { AppContext } from "../../contexts/AppContext.jsx";
import axios from "axios";
import {useCookies} from "react-cookie";
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const DebugConsole = () => {
  const {
    isDebuggerActive,
    isDebuggerOpen,
    toggleDebuggerModal,
    apiCalls,
    fetchAPICalls,
    matchsCronTasks,
    cronTasks
  } = useContext(AppContext);
  const [cookies] = useCookies(['token']);
  const token = localStorage.getItem('token') || cookies.token
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const startLogs = async () => {
      try {
        if (isDebuggerActive) {
          const response = await axios.get(`${apiUrl}/api/admin/start-logs`, {
            headers: {
              Authorization: `Bearer ${token}`,  // Si l'authentification est nécessaire
            }
          });
          console.log(response.data.message);
        }
      } catch (error) {
        console.error('Erreur lors du démarrage des logs:', error);
      }
    };

    startLogs();
  }, [isDebuggerActive]);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8080'); // URL du serveur WebSocket
    console.log(socket)
    socket.addEventListener('message', function (event) {
      const logEntry = JSON.parse(event.data);
      setLogs(prevLogs => [logEntry, ...prevLogs]); // Ajoute les nouveaux logs en haut
    });

    socket.addEventListener('error', function (event) {
      console.error('Erreur WebSocket:', event);
    });

    return () => {
      socket.close(); // Fermer la connexion WebSocket lorsque le composant est démonté
    };
  }, []);

  if (!isDebuggerActive) return null;

  return (
    <div className={`debugger fixed z-[80] max-w-[94%] right-0.5 top-0.5 transition-transform duration-300 ease-in-out ${isDebuggerOpen ? 'translate-x-0' : 'translate-x-full'} before:content-[''] before:absolute before:inset-0 before:bg-green-lime before:-translate-x-0.5 before:translate-y-0.5 before:border before:border-black before:z-[1]`}>
      <button
        className={`absolute z-[2] block h-5 w-6 top-0 -left-4 bg-black text-left pl-1 focus:outline-none`}
        onClick={toggleDebuggerModal}
      >
        <FontAwesomeIcon icon={faChevronLeft} className={`text-green-lime-deep text-xs inline-block align-[0] transition-transform duration-300 ease-in-out ${isDebuggerOpen ? 'rotate-180' : 'rotate-0'}`} />
      </button>
      <div className="bg-black px-2 py-2 relative z-[2] flex flex-col">
        <div className="flex flex-row mb-2">
          <button
            onClick={() => fetchAPICalls()}
            className="relative block h-fit mr-2 -mb-1 before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded before:bg-green-lime before:border-black before:border-2 group"
          >
            <span
              className="relative z-[2] w-full flex flex-row justify-center border-2 border-black text-black px-0.5 py-0.5 rounded text-center text-xs font-sans uppercase font-bold shadow-md bg-white transition translate-y-[-3px] translate-x-[-3px] group-hover:-translate-y-0 group-hover:-translate-x-0">
              <FontAwesomeIcon icon={faArrowsRotate}/>
            </span>
          </button>
          <p className="font-title font-bold text-green-lime-deep leading-4 my-auto w-[200px]">
            <span className="inline-block mr-0.5">API Calls : </span>
            {apiCalls.current !== undefined ? (
              <>
              <span className={`inline-block font-bold ${
                apiCalls.current >= (3 / 4 * apiCalls.limit_day) ? 'text-red-600' :
                  apiCalls.current >= (1 / 3 * apiCalls.limit_day) ? 'text-orange-500' :
                    'text-green-lime-deep'
              }`}>{apiCalls.current}</span>
                <span className="inline-block">/</span>
                <span className="inline-block">{apiCalls.limit_day}</span>
              </>
            ) : (
              <span className="inline-block">{apiCalls.error_message}</span>
            )}
          </p>
        </div>
        <div>
          <p className="font-title font-bold text-green-lime-deep">Cron Tasks</p>
          <div
            className="overflow-y-scroll overflow-x-scroll max-w-[250px] max-h-[100px] border-t border-l border-green-lime-deep">
            <ul className="flex flex-col w-max">
              {cronTasks && cronTasks.length > 0 ? (
                cronTasks.map((task, index) => <li key={index}><p
                  className="font-sans text-xxs text-green-lime-deep font-light">{task.task} - {task.schedule}</p>
                </li>)
              ) : (
                <p>Aucune tâche programmée</p>
              )}
            </ul>
          </div>
        </div>
        <div>
          <p className="font-title font-bold text-green-lime-deep">Next Matchs Updates</p>
          <div
            className="overflow-y-scroll overflow-x-scroll max-w-[250px] max-h-[100px] border-t border-l border-green-lime-deep">
            <ul className="flex flex-col w-max">
              {matchsCronTasks && matchsCronTasks.length > 0 ? (
                matchsCronTasks.map((task, index) => <li key={index}><p
                  className="font-sans text-xxs text-green-lime-deep font-light">{task.id} - {task.cronTime}</p>
                </li>)
              ) : (
                <p>Aucune tâche programmée</p>
              )}
            </ul>
          </div>
        </div>
        {/* Section pour les logs en temps réel */}
        <div className="h-[100px]">
          <p className="font-title font-bold text-green-lime-deep">Logs</p>
          <button
            className={`absolute z-[2] block h-5 w-6 top-0 -left-4 bg-black text-left pl-1 focus:outline-none`}
            onClick={toggleDebuggerModal}
          >
            <FontAwesomeIcon icon={faChevronLeft}
                             className={`text-green-lime-deep text-xs inline-block align-[0] transition-transform duration-300 ease-in-out ${isDebuggerOpen ? 'rotate-180' : 'rotate-0'}`}/>
          </button>
          <div className="overflow-y-scroll max-w-[250px] max-h-[200px] border-t border-l border-green-lime-deep">
            <ul className="flex flex-col">
              {logs.map((log, index) => (
                <li key={index}>
                  <p className="font-sans text-xxs text-white font-light">
                    {log.timestamp} - {log.level}: {log.message}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugConsole;
