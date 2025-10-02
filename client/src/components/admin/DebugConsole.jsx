import React, { useContext, useState } from "react";
import { AppContext } from "../../contexts/AppContext.jsx";
import { useCookies } from "react-cookie";

const DebugConsole = () => {
  const { clock, isDebuggerActive, logs } = useContext(AppContext);
  const [cookies] = useCookies(["token"]);

  const [isOpen, setIsOpen] = useState(false);     // contenu plié/déplié
  const [isVisible, setIsVisible] = useState(false); // panneau visible/caché

  const [expanded, setExpanded] = useState({ warning: false, combined: false, error: false });

  if (!isDebuggerActive) return null;

  const renderLogSection = (title, key) => (
    <div>
      <div
        className="cursor-pointer font-bold bg-gray-200 px-2 py-1 rounded mt-2"
        onClick={() => setExpanded(prev => ({ ...prev, [key]: !prev[key] }))}
      >
        {title} {expanded[key] ? "▲" : "▼"}
      </div>
      {expanded[key] && (
        <div className="bg-black text-green-400 font-mono text-[10px] p-2 mt-1 max-h-40 overflow-y-auto rounded">
          <pre>{logs[key]}</pre>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Panneau Debug */}
      <div
        className={`fixed top-0 right-0 z-[80] w-full bg-white border border-black transition-transform duration-300 ease-in-out shadow-flat-black-adjust
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
            {/* Logs */}
            {logs.warning && renderLogSection("⚠️ Warnings", "warning")}
            {logs.combined && renderLogSection("📜 Combined", "combined")}
            {logs.error && renderLogSection("❌ Errors", "error")}
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
