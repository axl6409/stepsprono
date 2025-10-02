import React, { memo } from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Dashboard from './pages/Dashboard';
import Rewards from './pages/Rewards';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Reglement from './pages/Reglement.jsx';
import Matchs from './pages/Matchs.jsx';
import MatchsHistory from './pages/MatchsHistory.jsx';
import Classements from './pages/Classements.jsx';
import Teams from './pages/Teams.jsx';
import TeamPlayers from './pages/TeamPlayers.jsx';
import UserSettings from './pages/user/UserSettings.jsx';
import Admin from './pages/admin/Admin.jsx';
import EditUser from './components/admin/EditUser.jsx';
import EditField from './components/user/EditField.jsx';
import Settings from './pages/admin/Settings.jsx';
import AdminRewards from './pages/admin/AdminRewards.jsx';
import AdminTeams from './pages/admin/AdminTeams.jsx';
import AdminMatchs from './pages/admin/AdminMatchs.jsx';
import AdminPlayers from './pages/admin/AdminPlayers.jsx';
import AdminCompetitions from './pages/admin/AdminCompetitions.jsx';
import AdminBets from './pages/admin/AdminBets.jsx';
import AdminSeasons from './pages/admin/AdminSeasons.jsx';
import AdminEvents from './pages/admin/AdminEvents.jsx';
import AdminUsers from './pages/admin/AdminUsers.jsx';
import MatchDetails from './pages/MatchDetails.jsx';
import WeekRecap from './pages/WeekRecap.jsx';
import RankingProvider from './contexts/RankingContext.jsx';
import Contributions from './pages/Contributions.jsx';
import UserStats from './pages/user/UserStats.jsx';
import ViewedProfileRouteSync from './contexts/ViewedProfileRouteSync.jsx';
import AdminRules from './pages/admin/AdminRules.jsx';
import JourDeChasse from "./pages/rules/JourDeChasse.jsx";
import SpecialRuleConfig from "./pages/admin/SpecialRuleConfig.jsx";
import RulePresent from "./pages/rules/RulePresent.jsx";

const RankingLayout = () => (
  <RankingProvider>
    <Outlet />
  </RankingProvider>
);

const AuthedShell = () => (
  <>
    <ViewedProfileRouteSync />
    <Outlet />
  </>
);

const AppRoutes = memo(({ user, token, setUser }) => {
  return (
    <AnimatePresence>
      <Routes>
        <Route element={<AuthedShell />}>
          <Route element={<RankingLayout />}>
            <Route path="/dashboard/" element={<ProtectedRoute component={Dashboard} componentProps={{ userId: user?.id }} />} />
            <Route path="/dashboard/:userId" element={<ProtectedRoute component={Dashboard} />} />
            <Route path="/stats/:userId?" element={<ProtectedRoute component={UserStats} />} />
            <Route path="/matchs/history" element={<ProtectedRoute component={MatchsHistory} />} />
            <Route path="/matchs/history/:matchId" element={<ProtectedRoute component={MatchDetails} />} />
            <Route path="/classement" element={<ProtectedRoute component={Classements} />} />
            <Route path="/week-recap" element={<ProtectedRoute component={WeekRecap} />} />
          </Route>

          <Route path="/matchs" element={<ProtectedRoute component={Matchs} />} />
          <Route path="/rewards/:userId?" element={<ProtectedRoute component={Rewards} />} />
          <Route path="/reglement" element={<ProtectedRoute component={Reglement} />} />
          {/* Rules */}
          <Route path="/hunt-day" element={<ProtectedRoute component={RulePresent} />} />
          <Route path="/hidden-predictions" element={<ProtectedRoute component={RulePresent} />} />
          <Route path="/alliance-day" element={<ProtectedRoute component={RulePresent} />} />
          {/* End Rules */}
          <Route path="/settings/username" element={<ProtectedRoute component={() => <EditField title="Changer le pseudo" fieldName="username" fieldLabel="Nouveau pseudo" user={user} token={token} setUser={setUser} />} />} />
          <Route path="/settings/email" element={<ProtectedRoute component={() => <EditField title="Changer le mail" fieldName="email" fieldLabel="Nouveau mail" user={user} token={token} setUser={setUser} type="email" />} />} />
          <Route path="/settings/password" element={<ProtectedRoute component={() => <EditField title="Changer le mot de passe" fieldName="password" fieldLabel="Nouveau mot de passe" user={user} token={token} setUser={setUser} type="password" />} />} />
          <Route path="/settings/team" element={<ProtectedRoute component={() => <EditField title="Changer l'équipe de coeur" fieldName="team" fieldLabel="Changer l'équipe de coeur" user={user} token={token} setUser={setUser} />} />} />
          <Route path="/contributions" element={<ProtectedRoute component={Contributions} />} />
          <Route path="/teams" element={<ProtectedRoute component={Teams} />} />
          <Route path="/teams/:teamId/players" element={<TeamPlayers />} />
          <Route path="/user/settings" element={<ProtectedRoute component={() => <UserSettings user={user} token={token} setUser={setUser} />} />} />
          <Route path="/admin" element={<ProtectedRoute component={Admin} />} />
          <Route path="/admin/users" element={<ProtectedRoute component={AdminUsers} />} />
          <Route path="/admin/users/edit/:id" element={<ProtectedRoute component={EditUser} />} />
          <Route path="/admin/settings" element={<ProtectedRoute component={Settings} />} />
          <Route path="/admin/rules" element={<ProtectedRoute component={AdminRules} />} />
          <Route path="/admin/special-rule/:id" element={<SpecialRuleConfig />} />
          <Route path="/admin/rewards" element={<ProtectedRoute component={AdminRewards} />} />
          <Route path="/admin/seasons" element={<ProtectedRoute component={AdminSeasons} />} />
          <Route path="/admin/teams" element={<ProtectedRoute component={AdminTeams} />} />
          <Route path="/admin/matchs" element={<ProtectedRoute component={AdminMatchs} />} />
          <Route path="/admin/players" element={<ProtectedRoute component={AdminPlayers} />} />
          <Route path="/admin/competitions" element={<ProtectedRoute component={AdminCompetitions} />} />
          <Route path="/admin/bets" element={<ProtectedRoute component={AdminBets} />} />
          <Route path="/admin/notifications" element={<ProtectedRoute component={AdminEvents} />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
});

export default AppRoutes;
