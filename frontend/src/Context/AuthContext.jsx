import React, { createContext, useState } from 'react';

export const authDataContext = createContext();

function AuthContext({ children }) {
  // Port 8000 ko badal kar 8000 karein kyunki backend index.js mein yahi hai
  // Automatically detect server URL: use current origin if on Vercel, else use env or localhost
  const serverUrl = window.location.hostname.includes("vercel.app") 
    ? window.location.origin 
    : (import.meta.env.VITE_SERVER_URL || "http://localhost:8000"); 
  
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