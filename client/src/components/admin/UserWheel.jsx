import React, {useEffect, useState} from "react";
import { Wheel } from "react-custom-roulette";

const wheelStyleProps = {
  backgroundColors: ["#F2FFCC", "#CCFFCC", "#FFCCFF", "#F3F5B2", "#FFB5BE", "#CCCCFF"],
  textColors: ["#000000"],
  fontSize: 20,
  fontFamily: "Roboto Mono",
  outerBorderColor: "#000000",
  outerBorderWidth: 6,
  innerBorderColor: "#000000",
  innerBorderWidth: 40,
  radiusLineColor: "#000000",
  radiusLineWidth: 1,
  perpendicularText: false,
  spinDuration: 0.6,
};

const UserWheel = ({ users, onSelect, initialUser }) => {
  const [spinning, setSpinning] = useState(false);
  const [prizeIndex, setPrizeIndex] = useState(0);

  useEffect(() => {
    if (initialUser && users.length) {
      const index = users.findIndex((u) => Number(u.id) === Number(initialUser));
      if (index !== -1) {
        setPrizeIndex(index);
      }
    }
  }, [initialUser, users]);

  const spin = () => {
    if (!users.length) return;
    const i = Math.floor(Math.random() * users.length);
    setPrizeIndex(i);
    setSpinning(true);
  };

  return (
    <div className="flex flex-col items-center">
      <Wheel
        mustStartSpinning={spinning}
        prizeNumber={prizeIndex}
        data={users.map((u) => ({ option: u.username }))}
        onStopSpinning={() => {
          setSpinning(false);
          onSelect(users[prizeIndex]);
        }}
        {...wheelStyleProps}
      />
      <button
        translate="no"
        onClick={spin}
        disabled={spinning}
        className={`mt-4 px-4 py-2 ${spinning ? "bg-purple-light" : "bg-green-deep"}  text-black font-roboto font-medium uppercase shadow-flat-black rounded-full border border-black`}
      >
        {spinning ? "La roue tourne..." : "Lancer la roue"}
      </button>
    </div>
  );
};

export default UserWheel;
