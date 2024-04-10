import React, { useContext } from "react";
import Navbar from "./components/nav/Navbar";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Rewards from "./pages/Rewards";
import { UserContext } from "./contexts/UserContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Reglement from "./pages/Reglement.jsx";
import Matchs from "./pages/Matchs.jsx";
import Bets from "./pages/Bets.jsx";
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

  return isAuthenticated ? (
    <>
      <Navbar />
      <div className="container mx-auto">
        <Routes>
          <Route path="/dashboard/:userId?" element={<ProtectedRoute component={Dashboard} />} />
          <Route path="/rewards/:userId?" element={<ProtectedRoute component={Rewards} />} />
          <Route path="/reglement" element={<ProtectedRoute component={Reglement} />} />
          <Route path="/matchs" element={<ProtectedRoute component={Matchs} />} />
          <Route path="/pronostic/:matchId" element={<ProtectedRoute component={Bets} />} />
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
      </div>
    </>
  ) : (
    <>
      <div className="container mx-auto">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </>
  );
};

export default AuthenticatedApp;
