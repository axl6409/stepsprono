import React from "react";
import PropTypes from "prop-types";

const CircularText = ({ text, radius = 100 }) => {
  const letters = text.split("");
  const angleStep = 360 / letters.length;

  return (
    <div
      style={{
        position: "relative",
        width: `${radius * 2}px`,
        height: `${radius * 2}px`,
        borderRadius: "50%", // Pour dessiner un cercle
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {letters.map((letter, index) => {
        const angle = angleStep * index; // Calcule l'angle pour chaque lettre
        const x = radius * Math.cos((angle * Math.PI) / 180);
        const y = radius * Math.sin((angle * Math.PI) / 180);

        return (
          <span
            key={index}
            style={{
              position: "absolute",
              transform: `translate(${x}px, ${y}px) rotate(${angle + 90}deg)`,
              transformOrigin: "center",
              fontSize: "12px",
              textTransform: "uppercase",
            }}
          >
            {letter}
          </span>
        );
      })}
    </div>
  );
};

CircularText.propTypes = {
  text: PropTypes.string.isRequired,
  radius: PropTypes.number,
};

export default CircularText;
