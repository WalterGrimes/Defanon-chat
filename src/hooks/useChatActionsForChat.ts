import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CometChat } from "@cometchat/chat-sdk-javascript";


export const useChatActionsForChat = () => {
    const [messages, setMessages] = useState<CometChat.BaseMessage[]>([]);
    const [messageText, setMessageText] = useState<string>('');
    const { guid } = useParams<{ guid: string }>();
    const navigate = useNavigate();
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = chatContainerRef.current;
        if (el){
            el.scrollTo({
            top:  el.scrollHeight,
            behavior: 'smooth'
            })
        }
    }, [messages])
    

    const fetchMessages = () => {
        const limit = 20;
        const messageRequest = new CometChat.MessagesRequestBuilder()
            .setGUID(guid!)
            .setLimit(limit)
            .build();

        messageRequest.fetchPrevious().then(
            msgs => {
                console.log("Сообщ загружен", msgs)
                setMessages([...msgs]);
            },
            error => console.log('Message fetching failed', error)
        );
    };

    const joinGroup = () => {
        if (!guid) return;
        CometChat.getGroup(guid).then(
            (existingGroup) => {
                console.log("niggers",existingGroup)
                const groupType = existingGroup.getType() as CometChat.GroupType;
                CometChat.joinGroup(guid, groupType).then(
                    () => fetchMessages(),
                    (error) => {
                        console.log("niggers", error)
                        if (error.code === 'ERR_ALREADY_JOINED') fetchMessages();
                    }
                );
            },
            (error) => {
                if (error.code === 'ERR_ALREADY_JOINED') {
                    fetchMessages();
                }
                navigate('/chatboxes');
            }
        );
    };

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageText.trim() || !guid) return;

        const textMessage = new CometChat.TextMessage(guid, messageText, CometChat.RECEIVER_TYPE.GROUP);

        CometChat.sendMessage(textMessage).then(
            message => {
                setMessageText('');
                setMessages(prev => [...prev, message]);
            },
            error => console.log('Message sending failed:', error)
        );
    };

    const leaveRoom = () => {
        if (!guid) return;
        CometChat.leaveGroup(guid).then(
            () => {
                setMessages([]);
                setMessageText("");
                navigate('/chatboxes');
            },
            () => navigate('/chatboxes')
        );
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessageText(e.target.value);
    }

    return {
        messages, setMessages,
        messageText, setMessageText,
        sendMessage, joinGroup, leaveRoom, fetchMessages, handleChange, chatContainerRef,
        guid
    };
};