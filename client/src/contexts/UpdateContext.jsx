import React, { createContext, useContext, useState } from 'react';

export const UpdateContext = createContext();

export const UpdateProvider = ({ children }) => {
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateInfo, setUpdateInfo] = useState({});

  const showUpdate = (versionInfo) => {
    setUpdateInfo(versionInfo);
    setShowUpdateModal(true);
  };

  const hideUpdate = () => {
    setShowUpdateModal(false);
    setUpdateInfo({});
  };

  return (
    <UpdateContext.Provider value={{ showUpdate, hideUpdate, showUpdateModal, updateInfo }}>
      {children}
    </UpdateContext.Provider>
  );
};

export const useUpdate = () => {
  return useContext(UpdateContext);
};
