import React, { useContext, createContext, useState, useEffect } from 'react';
import { authDataContext } from './AuthContext';
import axios from 'axios';

// Context creation
const userDataContext = createContext();

function UserContext({ children }) {
    const { serverUrl } = useContext(authDataContext);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true); // Persist login state on refresh

    const getCurrentUser = async () => {
        const token = localStorage.getItem('token'); 
        
        if (!token) {
            setUserData(null);
            setLoading(false);
            return null; 
        }

        try {
            const result = await axios.get(
                `${serverUrl}/api/user/currentuser`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true
                }
            );
            const data = result.data.user || result.data;
            setUserData(data);
            setLoading(false);
            return data;
        } catch (error) {
            setUserData(null);
            setLoading(false);
            console.error("Error fetching user:", error);
            return null;
        }
    };

    useEffect(() => {
        if (serverUrl) {
            getCurrentUser();
        } else {
            setLoading(false);
        }
    }, [serverUrl]); 

    const value = { userData, setUserData, getCurrentUser, loading };

    return (
        <userDataContext.Provider value={value}>
            {/* Jab tak check na ho jaye ke user logged in hai ya nahi, tab tak app load na ho */}
            {!loading && children}
        </userDataContext.Provider>
    );
}

// FIX: Alag alag exports taake Vite crash na kare
export { userDataContext };
export default UserContext;