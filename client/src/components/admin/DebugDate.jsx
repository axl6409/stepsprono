import React, { useContext, useState } from "react";
import { AppContext } from "../../contexts/AppContext.jsx";
import { useCookies } from "react-cookie";

const DebugConsole = () => {
  const { clock, isDebuggerActive } = useContext(AppContext);
  const [cookies] = useCookies(["token"]);

  const [isOpen, setIsOpen] = useState(false);     // contenu plié/déplié
  const [isVisible, setIsVisible] = useState(true); // panneau visible/caché

  if (!isDebuggerActive) return null;

  return (
    <>
      {/* Panneau Debug */}
      <div
        className={`fixed top-2 right-0 z-[80] w-72 bg-white border border-black shadow-lg rounded transition-transform duration-300 ease-in-out
        ${isVisible ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex justify-between items-center bg-green-lime px-2 py-1">
          <span
            className="font-bold text-sm cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
          >
            🛠 Debug {isOpen ? "▲" : "▼"}
          </span>
          <button
            onClick={() => setIsVisible(false)}
            className="text-xs px-2 py-0.5 border border-black rounded bg-white hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        {/* Contenu */}
        {isOpen && (
          <div className="p-2 text-xs space-y-1">
            <div>
              <strong>Date actuelle :</strong>
              <br />
              {clock.now
                ? clock.now.format("dddd D MMMM YYYY HH:mm:ss")
                : "Chargement..."}
            </div>
            <div>
              <strong>Timezone :</strong> {clock.tz}
            </div>
            <div>
              <strong>Mode simulé :</strong> {clock.simulated ? "Oui" : "Non"}
            </div>
          </div>
        )}
      </div>

      {/* Bouton flottant pour réouvrir */}
      {!isVisible && (
        <button
          onClick={() => setIsVisible(true)}
          className="fixed top-2 right-2 z-[90] text-xs px-2 py-1 border border-black rounded bg-green-lime hover:bg-green-400"
        >
          🛠
        </button>
      )}
    </>
  );
};

export default DebugConsole;
