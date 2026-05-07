import React, { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";
import { userDataContext } from "./UserContext";
import { authDataContext } from "./AuthContext";

export const SocketContext = createContext();

export const SocketContextProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const { serverUrl } = useContext(authDataContext);
    const { userData } = useContext(userDataContext);

    useEffect(() => {
        // Vercel doesn't support Socket.io, so we avoid connecting on production domains
        const isVercel = window.location.hostname.includes("vercel.app");
        
        if (serverUrl && userData && userData._id && !isVercel) {
            const newSocket = io(serverUrl, {
                query: {
                    userId: userData._id
                }
            });


            setSocket(newSocket);

            newSocket.on("getOnlineUsers", (users) => {
                setOnlineUsers(users);
            });

            return () => {
                newSocket.close();
                setSocket(null);
            };
        }
    }, [userData, serverUrl]);

    return (
        <SocketContext.Provider value={{ socket, onlineUsers }}>
            {children}
        </SocketContext.Provider>
    );
};
