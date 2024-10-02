import React, { useContext } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { AppContext } from "./contexts/AppContext.jsx";
import AuthenticatedApp from "./AuthenticatedApp.jsx";
import Loader from "./components/partials/Loader.jsx";

const AppContent = () => {
  const { isLoading } = useContext(AppContext);

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <Router>
          <AuthenticatedApp />
        </Router>
      )}
    </>
  );
};

export default AppContent;