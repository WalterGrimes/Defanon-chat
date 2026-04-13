import { useEffect, useState } from "react";
import { v4 as uuid } from 'uuid';
import { Navigate, useLocation } from "react-router-dom";
import { Row, Col, Container, Form, Button, Navbar } from 'react-bootstrap';
import { CometChat } from "@cometchat/chat-sdk-javascript";
import { useChatActionsForChat } from "../hooks/useChatActionsForChat";
import { useChatActionsForSignChat } from "../hooks/useChatActionsForSignChat";
import { GreenLoader } from "../features/Loaders";
import { getUserColor } from "../utilits/ColorHelper";

function Chat() {
    const location = useLocation();

    const { messages, setMessages,
        messageText, setMessageText,
        sendMessage, leaveRoom, handleChange, chatContainerRef, fetchMessages,
        guid, isLeaving } = useChatActionsForChat();

    const { getUser, setUser, user, redirect } = useChatActionsForSignChat();

    const welcomingUser = user ? `- ${(user as any).name || (user as any).uid || 'Guest'}` : '- Loading...';

    const [groupName, setGroupName] = useState<string>();


    if (!guid) {
        return <Navigate to='/chatboxes' />
    }

    useEffect(() => {
        if (guid) {
            CometChat.getGroup(guid).then(
                (group) => {
                    setGroupName(group.getName());
                    console.log("Зашло,данные группы:", group)
                },
                (error) => {
                    console.log("Ошибка при получении данных группы", error)
                }
            )
        }
    }, [guid])

    useEffect(() => {
        setMessages([]);
        setMessageText('');

        const locationState = location.state as { user?: any };
        if (locationState?.user) {
            setUser(locationState.user);
        }

        getUser(() => fetchMessages());

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
        console.log("No user found")//Проверка на нового пользователя
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
                                <Button onClick={leaveRoom} variant='outline-primary'>Leave </Button>

                            </div>
                        </div>

                        <ul className='list-group' style={{ marginBottom: '80px' }}>
                            {messages.length > 0 ? (
                                messages.map((msg: any) => {
                                    const senderUid = msg.sender?.uid || 'unknown';

                                    const userColor = getUserColor(senderUid);

                                    return (
                                        <li className='list-group-item' key={msg.id || uuid()}>
                                            <strong style={{ color: userColor }}>
                                                {msg.sender?.name || 'Unknown'}:
                                            </strong>
                                            <span className="ms-2">{msg.text}</span>
                                        </li>
                                    );
                                })
                            ) : (
                                <div className='text-center mt-5'>
                                    <p className='lead'>Fetching Messages...</p>
                                </div>
                            )}
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
                            placeholder='Type Message here...'
                            onChange={handleChange}
                        />
                        <Button variant='primary' type='submit'>Send</Button>
                    </Form>
                </Container>
            </Navbar>
        </div>
    );
}




export default Chat;