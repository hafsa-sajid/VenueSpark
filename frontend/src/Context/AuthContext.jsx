import React, { createContext, useState } from 'react';

export const authDataContext = createContext();

function AuthContext({ children }) {
  // Use the actual deployed backend URL
  const serverUrl = import.meta.env.VITE_SERVER_URL || "https://venue-spark-xamg.vercel.app"; 
  
  let [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  const value = {
    serverUrl,
    token,
    setToken,
    user,
    setUser,
    loading,
    setLoading
  };

  return (
    <authDataContext.Provider value={value}>
      {children}
    </authDataContext.Provider>
  );
}

export default AuthContext;