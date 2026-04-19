import { useEffect, useState } from "react";
import { v4 as uuid } from 'uuid';
import { Navigate, useLocation } from "react-router-dom";
import { Row, Col, Container, Form, Button, Navbar } from 'react-bootstrap';
import { CometChat } from "@cometchat/chat-sdk-javascript";
import { useChatActionsForChat } from "../hooks/useChatActionsForChat";
import { useChatActionsForSignChat } from "../hooks/useChatActionsForSignChat";
import { GreenLoader, GreyLoader } from "../features/Loaders";
import { getUserColor } from "../utilits/ColorHelper";
import s from './Chat.module.css';

function Chat() {
    const location = useLocation();

    const { messages, setMessages,
        messageText, setMessageText,
        sendMessage, leaveRoom, handleChange, chatContainerRef, fetchMessages,
        guid,
        isLeaving, isSendingMessage } = useChatActionsForChat();

    const { getUser, setUser, user, redirect } = useChatActionsForSignChat();
    const [currentGroup, setCurrentGroup] = useState<CometChat.Group | null>(null);


    const welcomingUser = user ? `- ${(user as any).name || (user as any).uid || 'Guest'}` : '- Loading...';

    const [groupName, setGroupName] = useState<string>();
    const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(true);
    const [hasFetched, setHasFetched] = useState(false);

    if (!guid) {
        return <Navigate to='/chatboxes' />
    }

    useEffect(() => {
        if (guid) {
            CometChat.getGroup(guid).then(
                (group) => {
                    setGroupName(group.getName());
                    setCurrentGroup(group);
                    console.log("Зашло,данные группы:", group)
                },
                (error) => {
                    console.log("Ошибка при получении данных группы", error)
                }
            )
        }
    }, [guid])

    useEffect(() => {
        setIsLoadingMessages(true);
        setHasFetched(false);
        setMessages([]);
        setMessageText('');

        const locationState = location.state as { user?: any };
        if (locationState?.user) {
            setUser(locationState.user);
        }

        getUser(() => {
            fetchMessages().finally(() => {
                setTimeout(() => {
                    setIsLoadingMessages(false);
                    setHasFetched(true);
                }, 10);
            })
        })

        const listenerID = 'listener_id_' + uuid();
        CometChat.addMessageListener(
            listenerID,
            new CometChat.MessageListener({
                onTextMessageReceived: (textMessage: any) => {
                    if (textMessage.getReceiverGuid() === guid) {
                        setMessages(prev => [...prev, textMessage]);
                    }
                }
            })
        )

        return () => CometChat.removeMessageListener(listenerID);
    }, [guid])


    if (redirect) return <Navigate to='/' />;
    if (!user && !localStorage.getItem('cometchat:authToken')) {
        console.log("No user found")
    }

    if (isLeaving) {
        return <GreenLoader message="Leaving this box,please wait..." />
    }

    return (
        <div ref={chatContainerRef} className='bg-light page'>
            <Container>
                <Row>
                    <Col>
                        <div className='d-flex align-items-center justify-content-between'>
                            <h3 className='py-3 mb-0'>
                                {groupName || <GreenLoader message="загрузка..." />} <br />
                                Welcome to chat dear {welcomingUser}
                            </h3>
                            <div className='d-flex gap-2 align-items-center ms-3'>
                                <Button onClick={leaveRoom} variant='outline-primary'>Leave</Button>
                            </div>
                        </div>

                        <ul className='list-group' style={{ marginBottom: '80px' }}>
                            {isLoadingMessages ? (
                                <div className='text-center mt-5'>
                                    <GreenLoader message="Fetching Messages..." />
                                </div>
                            ) : messages.length > 0 ? (
                                messages.map((msg: any) => {
                                    const isAction = msg instanceof CometChat.Action || msg.type === 'action';

                                    if (isAction) {
                                        return (
                                            <li className='list-group-item text-center bg-light italic' key={msg.id || uuid()}>
                                                <small className="text-muted" style={{ fontStyle: 'italic' }}>
                                                    user {msg.message}
                                                </small>
                                            </li>
                                        )
                                    }

                                    const senderUid = msg.sender?.uid || 'unknown';
                                    const userColor = getUserColor(senderUid);
                                    const sentAt = msg.getSentAt();
                                    const time = new Date(sentAt * 1000).toLocaleDateString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })

                                    return (
                                        <li className={s.messageItem} key={msg.id || uuid()}>
                                            <span className={s.messageSender} style={{ color: userColor }}>
                                                {msg.sender?.name || 'Unknown'}
                                            </span>


                                            <div className={s.messageContent}>
                                                {currentGroup?.getOwner() === user?.getUid() && (
                                                    <button className="btn btn-sm btn-danger">Mute</button>
                                                )}
                                                
                                                <span className={s.messageText}>
                                                    {msg.text}
                                                </span>

                                                <small className={s.messageTime}>
                                                    {time}
                                                </small>
                                            </div>
                                        </li>
                                    );
                                })
                            ) : hasFetched ? (
                                <div className='text-center mt-5'>
                                    <p className='lead'>Be first</p>
                                </div>
                            ) : null}
                        </ul>
                    </Col>
                </Row>
            </Container>

            <Navbar fixed='bottom' className="bg-white border-top">
                <Container>
                    <Form className='w-100 d-flex gap-2' onSubmit={sendMessage}>
                        <Form.Control
                            value={messageText}
                            required
                            disabled={isSendingMessage}
                            placeholder='Type Message here...'
                            onChange={handleChange}
                        />
                        <Button variant='primary'
                            type='submit'
                            disabled={isSendingMessage}
                        >
                            {isSendingMessage ? (
                                <GreyLoader message="отправка..." />
                            ) : (
                                'Send'
                            )}
                        </Button>
                    </Form>
                </Container>
            </Navbar>
        </div>
    );
}

export default Chat;