import React from "react"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
  faAngleLeft,
  faAngleRight,
  faAnglesLeft, faAnglesRight,
  faCirclePlus,
  faCircleXmark,
  faPen
} from "@fortawesome/free-solid-svg-icons";

const Pagination = ({currentPage, totalPages, setCurrentPage}) => {
  return (
    <div className="pagination-buttons flex flex-row justify-center mt-4">
      <button
        className="group mx-4 w-[35px] h-[35px] flex flex-col justify-center text-center relative z-[5] cursor-pointer before:content-[''] before:absolute before:z-[2] before:bg-electric-blue before:inset-0 before:border-2 before:border-black"
        onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
        <span className="w-full h-full p-1 bg-white relative z-[3] translate-x-1 -translate-y-1 border-2 border-black transition duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-focus:translate-x-0 group-focus:translate-y-0">
          <FontAwesomeIcon icon={faAnglesLeft} className="mx-auto h-[25px] block" />
        </span>
      </button>
      <button
        className="group mx-4 w-[35px] h-[35px] flex flex-col justify-center text-center relative z-[5] cursor-pointer before:content-[''] before:absolute before:z-[2] before:bg-electric-blue before:inset-0 before:border-2 before:border-black"
        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
        <span className="w-full h-full p-1 bg-white relative z-[3] translate-x-1 -translate-y-1 border-2 border-black transition duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-focus:translate-x-0 group-focus:translate-y-0">
          <FontAwesomeIcon icon={faAngleLeft} className="mx-auto h-[25px] block" />
        </span>
      </button>
      <button
        className="group mx-4 w-[35px] h-[35px] flex flex-col justify-center text-center relative z-[5] cursor-pointer before:content-[''] before:absolute before:z-[2] before:bg-electric-blue before:inset-0 before:border-2 before:border-black"
        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
        <span className="w-full h-full p-1 bg-white relative z-[3] -translate-x-1 -translate-y-1 border-2 border-black transition duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-focus:translate-x-0 group-focus:translate-y-0">
          <FontAwesomeIcon icon={faAngleRight} className="mx-auto h-[25px] block" />
        </span>
      </button>
      <button
        className="group mx-4 w-[35px] h-[35px] flex flex-col justify-center text-center relative z-[5] cursor-pointer before:content-[''] before:absolute before:z-[2] before:bg-electric-blue before:inset-0 before:border-2 before:border-black"
        onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>
        <span className="w-full h-full p-1 bg-white relative z-[3] -translate-x-1 -translate-y-1 border-2 border-black transition duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-focus:translate-x-0 group-focus:translate-y-0">
          <FontAwesomeIcon icon={faAnglesRight} className="mx-auto h-[25px] block" />
        </span>
      </button>
    </div>
  )
}

export default Pagination