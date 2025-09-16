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

const AuthenticatedApp = () => {
  const { user, setUser } = useContext(UserContext);
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
    && location.pathname !== '/jour-de-chasse') {
    return <Navigate to="/jour-de-chasse" replace />;
  }

  if (isAuthenticated && location.pathname === '/') {
    return <Navigate to="/dashboard" replace />;
  }

  if (isAuthenticated) {
    return (
    <>
      <Navbar />
      <ViewedProfileProvider>

        <div className={`mx-auto transition-all duration-200 ease-in-out ${menuOpen ? "blur-sm" : ""}`}>
          <div style={{ width: '100%', height: '100%', position: 'fixed', zIndex: '1', inset: '0', opacity: currentRule?.rule_key === "hunt_day" && currentRule.status ? 1 : 0.3, pointerEvents: 'none' }}>
            {/*<Particles*/}
            {/*  particleColors={['#000000', '#000000']}*/}
            {/*  particleCount={500}*/}
            {/*  particleSpread={15}*/}
            {/*  speed={0.2}*/}
            {/*  particleBaseSize={100}*/}
            {/*  moveParticlesOnHover={false}*/}
            {/*  alphaParticles={false}*/}
            {/*  disableRotation={true}*/}
            {/*/>*/}
            {currentRule?.rule_key === "hunt_day" && currentRule.status
              ? <BulletRain />
              : <Particles
                particleColors={["#000000", "#000000"]}
                particleCount={500}
                particleSpread={15}
                speed={0.2}
                particleBaseSize={100}
                moveParticlesOnHover={false}
                alphaParticles={false}
                disableRotation={true}
              />
            }
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
