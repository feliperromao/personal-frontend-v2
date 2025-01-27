import React, { createContext, useContext, useState, ReactNode } from "react";

type GlobalState = {
  loading: boolean;
  setLoading: (value: boolean) => void;
};

const GlobalStateContext = createContext<GlobalState | undefined>(undefined);

const GlobalStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loading, updateLoading] = useState(false);
  const setLoading = (value: boolean) => updateLoading(value);

  return (
    <GlobalStateContext.Provider value={{ loading, setLoading }}>
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
