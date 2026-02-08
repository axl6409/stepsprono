import React, { useContext } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { UserContext } from "./contexts/UserContext.jsx";
import Navbar from "./components/nav/Navbar";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import { AppContext } from "./contexts/AppContext.jsx";
import Particles from "./components/animated/Particles.jsx";
import { ViewedProfileProvider } from "./contexts/ViewedProfileContext.jsx";
import AppRoutes from "./AppRoutes.jsx";
import BulletRain from "./components/animated/BulletRain.jsx";
import {RuleContext} from "./contexts/RuleContext.jsx";
import DebugConsole from "./components/admin/DebugConsole.jsx";
import HiddenPredictions from "./components/animated/HiddenPredictions.jsx";
import SnowFall from "./components/animated/SnowFall.jsx";
import GoalBackground from "./components/animated/OhMyGoal.jsx";

const AuthenticatedApp = () => {
  const { user, setUser, hasAdminAccess } = useContext(UserContext);
  const token = localStorage.getItem("token") || user?.token;
  const { isAuthenticated } = useContext(UserContext);
  const { menuOpen } = useContext(AppContext);
  const { currentRule } = useContext(RuleContext);
  const location = useLocation();

  const publicPaths = ['/', '/login', '/register'];

  if (!isAuthenticated && !publicPaths.includes(location.pathname)) {
    return <Navigate to="/" replace />;
  }

  if (isAuthenticated
    && user?.status === 'pending'
    && location.pathname !== '/reglement') {
    return <Navigate to="/reglement" replace />;
  }

  if (isAuthenticated && user?.status === 'ruled'
    && location.pathname !== '/hidden-predictions') {
    return <Navigate to="/hidden-predictions" replace />;
  }

  if (isAuthenticated && location.pathname === '/') {
    return <Navigate to="/dashboard" replace />;
  }

  if (isAuthenticated) {
    return (
    <>
      <Navbar />
      {hasAdminAccess && (
        <DebugConsole />
      )}
      <ViewedProfileProvider>

        <div className={`mx-auto transition-all duration-200 ease-in-out ${menuOpen ? "blur-sm" : ""}`}>
          <div
            style={{ width: '100%', height: '100%', position: 'fixed', zIndex: '1', inset: '0',
              opacity:
                (currentRule?.rule_key === "hunt_day" && currentRule.status) ||
                (currentRule?.rule_key === "hidden_predictions" && currentRule.status)
                  ? 1
                  : 0.3,
              pointerEvents: 'none' }}>
            {currentRule?.rule_key === "hunt_day" && currentRule.status ? (
              <BulletRain />
            ) : currentRule?.rule_key === "hidden_predictions" &&
            currentRule.status ? (
              <HiddenPredictions
                emojiCount={15}
                fadeInTime={1500}
                holdTime={2000}
                fadeOutTime={1500}
                delayTime={1000}
                maxOpacity={0.3}
              />
            ) : currentRule?.rule_key === "half_penalty_day" &&
              currentRule.status ? (
              <SnowFall
                snowflakeCount={50}
                minSpeed={0.5}
                maxSpeed={2}
                minSize={5}
                maxSize={12}
                snowflakeColor="#ededed"
                className=""
              />
            ) : currentRule?.rule_key === "goal_day" &&
              currentRule.status ? (
              <GoalBackground />
            ) : (
              <Particles
                particleColors={["#000000", "#000000"]}
                particleCount={500}
                particleSpread={15}
                speed={0.2}
                particleBaseSize={100}
                moveParticlesOnHover={false}
                alphaParticles={false}
                disableRotation={true}
              />
            )}
          </div>
          <AppRoutes user={user} token={token} setUser={setUser} />
        </div>
      </ViewedProfileProvider>
    </>
    );
  }

  return (
    <div className="container mx-auto">
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
};
export default AuthenticatedApp;
