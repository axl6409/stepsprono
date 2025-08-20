import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faCheck } from "@fortawesome/free-solid-svg-icons";

const InlineCopy = ({ label, value }) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        // fallback
        const ta = document.createElement("textarea");
        ta.value = value;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (e) {
      console.error("Copy failed:", e);
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <p className="text-sm leading-5 font-roboto text-black">
        <b>{label} :</b>{" "}
        <span className="font-mono select-all block">{value}</span>
      </p>
      <button
        type="button"
        onClick={copy}
        className={`shrink-0 inline-flex items-center justify-center rounded-lg border-2 border-black px-3 py-1 text-sm font-bold shadow-flat-black-adjust transition hover:shadow-none ${
          copied ? "bg-green-soft text-black" : "bg-white text-black"
        }`}
        aria-label={`Copier ${label}`}
      >
        <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
      </button>
    </div>
  );
};

export default InlineCopy;