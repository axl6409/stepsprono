import React, { useEffect, useState } from "react";
import Loader from "../partials/Loader.jsx";

const DayRanking = ({ matchday, token, apiUrl }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {

  }, [matchday, token, apiUrl])

  // if (isLoading) {
  //   return (
  //     <div className="text-center flex flex-col justify-center">
  //       <Loader />
  //     </div>
  //   );
  // }

  return (
    <div className="relative p-8 px-2 pt-8">
      <h2 className="font-rubik text-xl4 font-black text-black text-center leading-9 capitalize">Classement de la journée</h2>
    </div>
  )
}

export default DayRanking