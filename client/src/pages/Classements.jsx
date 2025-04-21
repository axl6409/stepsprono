import React from 'react';
import UserRanking from "../components/user/UserRanking.jsx";
import SimpleTitle from "../components/partials/SimpleTitle.jsx";
import DashboardButton from "../components/nav/DashboardButton.jsx";

const Classements = () => {

  return (
    <div className="inline-block relative w-full h-auto py-20">
      <DashboardButton />
      <SimpleTitle title={"Classement Steps"} stickyStatus={false} uppercase={true} fontSize={'2.5rem'}/>
      <div className="relative mt-28">
        <UserRanking />
      </div>
    </div>
  );
}

export default Classements;
