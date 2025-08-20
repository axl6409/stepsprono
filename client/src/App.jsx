// src/App.jsx
import React from "react";
import { UserProvider } from "./contexts/UserContext.jsx";
import 'moment/dist/locale/fr';
import moment from "moment";
import { AppProvider } from "./contexts/AppContext.jsx";
import { UpdateProvider } from "./contexts/UpdateContext";
import AppContent from "./AppContent.jsx";
import NotificationProvider from "./providers/NotificationProvider.jsx";
import VersionChecker from "./components/common/VersionChecker";
import UpdateModal from "./components/common/UpdateModal";

moment.updateLocale('fr', {});

const App = () => {
  return (
    <UserProvider>
      <AppProvider>
        <UpdateProvider>
          <NotificationProvider>
            <VersionChecker />
            <AppContent />
            <UpdateModal />
          </NotificationProvider>
        </UpdateProvider>
      </AppProvider>
    </UserProvider>
  );
};

export default App;
