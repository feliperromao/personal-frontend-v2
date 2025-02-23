import React, { createContext, useContext, useState, ReactNode } from "react";

type GlobalState = {
  loading: boolean;
  drawerOpen: boolean;
  setLoading: (value: boolean) => void;
  setDrawerOpen: (value: boolean) => void;
};

const GlobalStateContext = createContext<GlobalState | undefined>(undefined);

const GlobalStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const isOpenDrawer = localStorage.getItem("drawerOpen");
  const [loading, updateLoading] = useState(false);
  const [drawerOpen, updateDrawerOpen] = useState(!!isOpenDrawer);
  const setLoading = (value: boolean) => updateLoading(value);
  const setDrawerOpen = (value: boolean) => updateDrawerOpen(value);

  return (
    <GlobalStateContext.Provider value={{ loading, drawerOpen, setLoading, setDrawerOpen }}>
      {children}
    </GlobalStateContext.Provider>
  );
};

const useGlobalState = (): GlobalState => {
  const context = useContext(GlobalStateContext);
  if (!context) {
    throw new Error("useGlobalState must be used within a GlobalStateProvider");
  }
  return context;
};

export { GlobalStateProvider, useGlobalState };
