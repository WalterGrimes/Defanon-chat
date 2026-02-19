import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CometChat } from "@cometchat/chat-sdk-javascript";

export const useChatACtionsForSignChat = () => {
    const [user, setUser] = useState<CometChat.User | null>(null);
    const [redirect, setRedirect] = useState(false);
    const navigate = useNavigate();

    const logout = () => {
        CometChat.logout().then(() => {
            navigate('/');
            localStorage.removeItem('cometchat:authToken');
            setRedirect(true);
        });
    };

    const reAuthenticateUserWithToken = (token?: string) => {
        const authToken = token || localStorage.getItem('cometchat:authToken');
        if (!authToken) return;

        CometChat.login(authToken).then(
            user => {
                console.log("Пользователь залогинен:", user);
                setUser(user);
            },
            error => console.log("login failed", error)
        );
    };

    const getUser = (onSuccess: () => void) => {
        CometChat.getLoggedinUser().then(
            user => {
                if (user) {
                    setUser(user);
                    onSuccess(); // это значит если юзер есть,значит можно двигаться дальше
                } else {
                    reAuthenticateUserWithToken();
                }
            },
            () => {
                const authToken = localStorage.getItem('cometchat:authToken');
                if (authToken) {
                    reAuthenticateUserWithToken(authToken);
                } else {
                    setRedirect(true);
                }
            }
        );
    };

    return { user,setUser, redirect, logout, getUser, reAuthenticateUserWithToken };
};