import React, { useContext } from "react";
import {Routes, Route, useLocation, Navigate} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { UserContext } from "./contexts/UserContext.jsx";
import Navbar from "./components/nav/Navbar";
import Dashboard from "./pages/Dashboard";
import Rewards from "./pages/Rewards";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Reglement from "./pages/Reglement.jsx";
import Matchs from "./pages/Matchs.jsx";
import Classements from "./pages/Classements.jsx";
import Teams from "./pages/Teams.jsx";
import TeamPlayers from "./pages/TeamPlayers.jsx";
import UserSettings from "./pages/user/UserSettings.jsx";
import Admin from "./pages/admin/Admin.jsx";
import Users from "./pages/admin/Users.jsx";
import EditUser from "./components/admin/EditUser.jsx";
import Settings from "./pages/admin/Settings.jsx";
import AdminTeams from "./components/admin/settings/AdminTeams.jsx";
import AdminMatchs from "./components/admin/settings/AdminMatchs.jsx";
import AdminPlayers from "./components/admin/settings/AdminPlayers.jsx";
import AdminCompetitions from "./components/admin/settings/AdminCompetitions.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";

const AuthenticatedApp = () => {
  const { isAuthenticated } = useContext(UserContext);
  const location = useLocation();

  if (isAuthenticated && location.pathname === '/') {
    return <Navigate to="/dashboard" replace />;
  }

  const pageVariants = {
    initial: { opacity: 0, x: -100 },
    in: { opacity: 1, x: 0 },
    outLeft: { opacity: 0, x: -100 },
    outRight: { opacity: 0, x: 100 }
  };

  return isAuthenticated ? (
    <>
      <Navbar />
      <div className="container mx-auto">
        <AnimatePresence>
          <Routes>
            <Route path="/dashboard/:userId?" element={
              <ProtectedRoute component={Dashboard} />
            } />
            <Route path="/rewards/:userId?" element={<ProtectedRoute component={Rewards} />} />
            <Route path="/reglement" element={<ProtectedRoute component={Reglement} />} />
            <Route path="/matchs" element={<ProtectedRoute component={Matchs} />} />
            <Route path="/classement" element={<ProtectedRoute component={Classements} />} />
            <Route path="/teams" element={<ProtectedRoute component={Teams} />} />
            <Route path="/teams/:teamId/players" element={<TeamPlayers />} />
            <Route path="/user/settings" element={<ProtectedRoute component={UserSettings} />} />
            <Route path="/admin" element={<ProtectedRoute component={Admin} />} />
            <Route path="/admin/users" element={<ProtectedRoute component={Users} />} />
            <Route path="/admin/users/edit/:id" element={<ProtectedRoute component={EditUser} />} />
            <Route path="/admin/settings" element={<ProtectedRoute component={Settings} />} />
            <Route path="/admin/teams" element={<ProtectedRoute component={AdminTeams} />} />
            <Route path="/admin/matchs" element={<ProtectedRoute component={AdminMatchs} />} />
            <Route path="/admin/players" element={<ProtectedRoute component={AdminPlayers} />} />
            <Route path="/admin/competitions" element={<ProtectedRoute component={AdminCompetitions} />} />
          </Routes>
        </AnimatePresence>
      </div>
    </>
  ) : (
    <>
      <div className="container mx-auto">
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={
              <Home />
              } />
            <Route path="/login" element={
              <Login />
              } />
            <Route path="/register" element={
              <Register />
              } />
          </Routes>
        </AnimatePresence>
      </div>
    </>
  );
};

export default AuthenticatedApp;
