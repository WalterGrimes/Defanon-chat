import React, { createContext, useContext, useEffect, useState } from "react";
import { CometChat } from "@cometchat/chat-sdk-javascript";

type ChatContextType = {
    user: CometChat.User | null;
    setUser: React.Dispatch<React.SetStateAction<CometChat.User | null>>
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);


export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<CometChat.User | null>(null);
    

   useEffect(() => {
        const token = localStorage.getItem('cometchat:authToken');
        
        if (!token) {
            setUser(null);
            return;
        }

        CometChat.getLoggedInUser().then(
            (loggedInUser) => {
                if (loggedInUser) {
                    setUser(loggedInUser);
                } else {
                    setUser(null);
                }
            },
            (error) => {
                console.error("Ошибка", error);
                setUser(null);
                localStorage.clear(); 
            }
        );
    }, []);

    return (
        <ChatContext.Provider value={{ user, setUser }}>
            {children}
        </ChatContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(ChatContext);
    if (!context) throw new Error("ошибка");
    return context;
}