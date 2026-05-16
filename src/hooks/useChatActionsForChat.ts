import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CometChat } from "@cometchat/chat-sdk-javascript";
import { useSpamSound } from "./PlaySpamSound";

export const useChatActionsForChat = () => {
    const [messages, setMessages] = useState<CometChat.BaseMessage[]>([]);
    const [messageText, setMessageText] = useState<string>('');
    const { guid } = useParams<{ guid: string }>();
    const navigate = useNavigate();
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const [isLeaving, setIsLeaving] = useState(false);
    const [isSendingMessage, setIsSendingMessage] = useState(false);

    const [muteUser, setMuteUser] = useState(false);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const [spamCount, setSpamCount] = useState(0);
    const spamResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const playSpamSound = useSpamSound();
    const lastClickRef = useRef(0);
    const spamCountRef = useRef(0);


    const leaveRoom = () => {
        if (!guid) return;

        setIsLeaving(true);

        CometChat.leaveGroup(guid).then(
            () => {
                setMessages([]);
                setMessageText("");
                navigate('/chatboxes');
            },
            () => navigate('/chatboxes')
        );
    };

    useEffect(() => {
        const mutedUntil = localStorage.getItem(`chat_muted_until${guid}`);
        if (mutedUntil) {
            const timeLeft = Number(mutedUntil) - Date.now();
            if (timeLeft > 0) {
                setMuteUser(true);
                setTimeout(() => {
                    setMuteUser(false);
                    localStorage.removeItem(`chat_muted_until${guid}`);
                }, timeLeft);
            } else {
                localStorage.removeItem(`chat_muted_until${guid}`);
            }
        }
    }, []);

    const muteUserWithPreloader = (targetUID: string) => {
        const duration = 300000;
        const unviewDate = Date.now() + duration;

        localStorage.setItem(`chat_muted_until${guid}`, unviewDate.toString());
        localStorage.setItem(`last_muted_uid_${guid}`, targetUID);

        setMuteUser(true);

        setTimeout(() => {
            setMuteUser(false);
            localStorage.removeItem(`chat_muted_until${guid}`);
        }, duration);
    };


    useEffect(() => {
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
        });
    }, [messages])



    const fetchMessages = async () => {
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
                console.log("data of existing froup:", existingGroup)
                const groupType = existingGroup.getType() as CometChat.GroupType;
                CometChat.joinGroup(guid, groupType).then(
                    () => fetchMessages(),
                    (error) => {
                        console.log("error:", error)
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

        const now = Date.now();
        const diff = now - lastClickRef.current;

        if (diff < 1500) {
            spamCountRef.current += 1;
            setSpamCount(spamCountRef.current);
        } else {
            spamCountRef.current = 1;
            setSpamCount(1);
        }

        lastClickRef.current = now;
        playSpamSound();

        if (spamResetTimer.current) clearTimeout(spamResetTimer.current);
        spamResetTimer.current = setTimeout(() => {
            spamCountRef.current = 0;
            setSpamCount(0);
        }, 2000);

        if (spamCountRef.current > 10) return;
        if (diff < 50) return;

        setIsSendingMessage(true);

        const textMessage = new CometChat.TextMessage(
            guid,
            messageText,
            CometChat.RECEIVER_TYPE.GROUP
        );

        CometChat.sendMessage(textMessage)
            .then(message => {
                setMessageText('');
                setMessages(prev => [...prev, message]);
            })
            .catch(error => {
                console.log('Message sending failed:', error);
            })
            .finally(() => {
                setIsSendingMessage(false);
                setTimeout(() => inputRef.current?.focus(), 0);
            });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setMessageText(e.target.value);
    }



    return {
        messages, setMessages,
        messageText, setMessageText,
        sendMessage, joinGroup, leaveRoom, fetchMessages, handleChange, chatContainerRef,
        guid, isLeaving,
        isSendingMessage,
        muteUser, muteUserWithPreloader,
        inputRef, spamCount
    };
};