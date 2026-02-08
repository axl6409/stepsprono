import React from 'react';
import { Link } from "react-router-dom";
import AnimatedTitle from "../partials/AnimatedTitle.jsx";

const GoalDay = ({ rule, user, viewedUser, isOwnProfile }) => {
  return (
    <div className="block relative z-20 flex flex-col justify-center items-center mb-4">
      <div className="w-full -rotate-[5deg] relative">
        <AnimatedTitle title="Oh My Goal !" darkMode={true} stickyStatus={false} />
      </div>
      <Link
        to="/goal-day"
        className="w-fit absolute left-1/2 -translate-x-1/2 -top-6 fade-in block mx-auto before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-black before:border-black before:border group"
      >
        <span
          translate="no"
          className="relative z-[2] w-full block border border-black text-black uppercase font-regular text-sm font-roboto px-3 py-1 rounded-full text-center shadow-md bg-yellow-light transition -translate-y-1 group-hover:-translate-y-0"
        >
          Voir la video
        </span>
      </Link>
    </div>
  );
};

export default GoalDay;
