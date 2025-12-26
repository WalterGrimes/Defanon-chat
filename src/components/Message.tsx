import { useState } from "react";
import { MessageInput } from "./MessageInput";
import { addMessage } from "../features/chatSlice";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import Signup from "./ChatSign";
 
type Message = {
    id: string;
    text: string;
    username: string;
    timestamp: number;
};

function Chat() {    
    const messages: Message[] = useAppSelector((state) => state.chat.messages);
    const dispatch = useAppDispatch()


    const [username] = useState(() => `Anon_${Math.random().toString(36).substring(2, 6)}`);

    const handleSendMessage = (text: string) => {
        if (!text.trim()) return;

        console.log("Отправка сообщения", text);

       dispatch(addMessage({text, username}))
    };

    return (
        <div>
            <h2>Anon-chat</h2>
            <p>Your name is {username}</p>

            <div>
                {messages.map(msg => (
                    <div key={msg.id || msg.timestamp}>
                        <strong>{msg.username}</strong> {msg.text}
                    </div>
                ))}
            </div>
            <Signup/>
            <MessageInput onSendMessage={handleSendMessage}/>
           
        </div>
    )
}

export default Chat;