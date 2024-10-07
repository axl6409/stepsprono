// src/App.jsx
import React from "react";
import { UserProvider } from "./contexts/UserContext.jsx";
import 'moment/dist/locale/fr';
import moment from "moment";
import { AppProvider } from "./contexts/AppContext.jsx";
import AppContent from "./AppContent.jsx";
import NotificationProvider from "./providers/NotificationProvider.jsx";

moment.updateLocale('fr', {});

const App = () => {
  return (
    <UserProvider>
      <AppProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </AppProvider>
    </UserProvider>
  );
};

export default App;
