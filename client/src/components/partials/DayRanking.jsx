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
    <div className="relative p-8 px-2 pt-0">
      <h2>Classement de la journée</h2>
    </div>
  )
}

export default DayRanking