import React from "react"
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import Navbar from "./components/nav/Navbar"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import ProtectedRoute from './components/ProtectedRoute';
import {UserProvider} from "./contexts/UserContext.jsx";
import Teams from "./pages/Teams.jsx";
import Admin from "./pages/admin/Admin.jsx";
import Users from "./pages/admin/Users.jsx";
import Matchs from "./pages/Matchs.jsx";
import Classements from "./pages/Classements.jsx";
import Bets from "./pages/Bets.jsx";
import 'moment/dist/locale/fr'
import moment from "moment";
import Settings from "./pages/admin/Settings.jsx";
import UserSettings from "./pages/user/UserSettings.jsx";
import EditUser from "./components/admin/EditUser.jsx";
import Reglement from "./pages/Reglement.jsx";
import AdminTeams from "./components/admin/settings/AdminTeams.jsx";
import AdminMatchs from "./components/admin/settings/AdminMatchs.jsx";
import AdminPlayers from "./components/admin/settings/AdminPlayers.jsx";
import {AppProvider} from "./contexts/AppContext.jsx";

const App = () => {
  moment.updateLocale('fr', {})

  return (
    <UserProvider>
      <AppProvider>
        <Router>
          <Navbar />
          <div className="container mx-auto pb-16">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<ProtectedRoute component={Dashboard} />} />
              <Route path="/reglement" element={<ProtectedRoute component={Reglement} />} />
              <Route path="/matchs" element={<ProtectedRoute component={Matchs} />} />
              <Route path="/pronostic/:matchId" element={<ProtectedRoute component={Bets} />} />
              <Route path="/classement" element={<ProtectedRoute component={Classements} />} />
              <Route path="/teams" element={<ProtectedRoute component={Teams} />} />
              <Route path="/user/settings" element={<ProtectedRoute component={UserSettings} />} />
              <Route path="/admin" element={<ProtectedRoute component={Admin} />} />
              <Route path="/admin/users" element={<ProtectedRoute component={Users} />} />
              <Route path="/admin/users/edit/:id" element={<ProtectedRoute component={EditUser} />} />
              <Route path="/admin/settings" element={<ProtectedRoute component={Settings} />} />
              <Route path="/admin/teams" element={<ProtectedRoute component={AdminTeams} />} />
              <Route path="/admin/matchs" element={<ProtectedRoute component={AdminMatchs} />} />
              <Route path="/admin/players" element={<ProtectedRoute component={AdminPlayers} />} />
            </Routes>
          </div>
        </Router>
      </AppProvider>
    </UserProvider>
  )
}

export default App