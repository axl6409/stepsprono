import React, { useContext, useEffect, useState } from "react";
import Loader from "../partials/Loader.jsx";
import axios from "axios";
import useSticky from "../../hooks/useSticky.jsx";
import { Link } from "react-router-dom";
import { RuleContext } from "../../contexts/RuleContext.jsx";
import chasedRuleIcon from "../../assets/components/rules/jour_de_chasse.png";

const DayRanking = ({ matchday, season, token, apiUrl }) => {
  const { isSticky } = useSticky(100);
  const { fetchMatchdayRule } = useContext(RuleContext);
  const [isLoading, setIsLoading] = useState(true);
  const [ranking, setRanking] = useState([]);
  const colors = ["#6666FF", "#CC99FF", "#00CC99", "#F7B009", "#F41731"];
  const [usersColors, setUsersColors] = useState({});
  const [rule, setRule] = useState(null);

  useEffect(() => {
    const fetchRanking = async () => {
      if (!season) return;
      const seasonId =
        typeof season === "object" && season !== null ? season.id : season;
      if (!seasonId) return;
      try {
        setIsLoading(true);
        const response = await axios.get(
          `${apiUrl}/api/users/bets/ranking/${matchday}?seasonId=${seasonId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const rankingDatas = response.data.ranking;
        setRanking(rankingDatas);

        const newUsersColors = {};
        rankingDatas.forEach((user, index) => {
          newUsersColors[user.user_id] = colors[index % colors.length];
        });
        setUsersColors(newUsersColors);

        const fetchedRule = await fetchMatchdayRule(matchday);
        if (fetchedRule) {
          setRule(fetchedRule);
        } else {
          setRule(null);
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Erreur lors de la récupération du classement:", error);
        setIsLoading(false);
      }
    };

    if (matchday && season && token) {
      fetchRanking();
    }
  }, [matchday, season, token, apiUrl]);

  if (isLoading) {
    return (
      <div className="text-center flex flex-col justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="relative z-20 p-8 px-0 pt-8">
      <h2
        translate="no"
        style={isSticky ? { top: `50px` } : {}}
        className={`bg-white ${
          isSticky
            ? "sticky-element pb-2 !text-xl border-b-black border-b"
            : ""
        } font-rubik text-xl4 font-black text-black text-center leading-9 text-balance`}
      >
        Classement de la journée {matchday}
      </h2>
      {/* Affichage uniquement si rule est défini et correspond */}
      {rule && rule.rule_id === 1 && (
        <>
          <div className="absolute w-[150px] z-[100] top-0 right-4 transition-all duration-300 ease-in-out rotate-[10deg] rounded-full overflow-hidden z-10">
            <img
              className="h-full w-full object-contain"
              src={chasedRuleIcon}
              alt="Jour de Chasse"
            />
          </div>
        </>
      )}

      <ul className="px-6">
        {ranking.map((user, index) => {
          // Cherche si ce user a un résultat spécial uniquement si rule existe
          const ruleResult = rule?.results?.find(
            (r) => r.user_id === user.user_id
          );
          const huntResult = ruleResult ? ruleResult.hunt_result : 0;

          return (
            <Link
              to={`/dashboard/${user.user_id}`}
              key={user.user_id}
              className="relative bg-white flex justify-between border border-black rounded-xl my-4 shadow-flat-black-adjust"
            >
              <div
                className="absolute z-[25] bg-white -top-3 -left-4 border-2 border-black w-[40px] text-center h-[40px] rounded-full flex flex-row justify-center items-center shadow-flat-black-adjust"
                style={{ backgroundColor: usersColors[user.user_id] }}
              >
                <p
                  translate="no"
                  className="font-rubik w-full font-black text-stroke-black-2 text-white text-[140%] inline-block leading-[35px]"
                >
                  {index + 1}
                </p>
              </div>

              <p
                translate="no"
                className="w-4/5 font-roboto font-medium text-base text-black py-2"
              >
                {user.username}
              </p>

              <div className="w-1/5 relative flex items-center justify-center gap-2 border-l border-dashed border-black py-2">
                <p
                  translate="no"
                  className="font-rubik font-black text-l text-black"
                >
                  {String(user.points).padStart(2, "0")}
                </p>

                {/* Affiche uniquement si rule existe et huntResult !== 0 */}
                {rule && huntResult !== 0 && (
                  <p
                    className={`font-rubik absolute bg-white border border-black rounded-full shadow-flat-black-adjust w-6 h-6 -right-4 top-1/2 transform -translate-y-1/2 font-black text-xs leading-6 ${
                      huntResult > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {huntResult > 0 ? "+1" : "-1"}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </ul>
    </div>
  );
};

export default DayRanking;
