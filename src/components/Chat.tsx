import React, { useEffect, useState } from "react";
import { v4 as uuid } from 'uuid';
import { Navigate, useLocation } from "react-router-dom";
import { Row, Col, Container, Form, Button, Navbar } from 'react-bootstrap';
import { CometChat } from "@cometchat/chat-sdk-javascript";

function Chat () {
    const [redirect, setRedirect] = useState(false);
    const [user, setUser] = useState<CometChat.User | null>(null);
    const [receiverID, setReceiverID] = useState('supergroup');
    const [messageText, setMessageText] = useState<string>('');
    const [messages, setMessages] = useState<CometChat.BaseMessage[]>([]);
    const receiverType = CometChat.RECEIVER_TYPE.GROUP;

    const location = useLocation();

     const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();

        const textMessage = new CometChat.TextMessage(
            receiverID,
            messageText,
            receiverType
        );

        CometChat.sendMessage(textMessage).then(
            message => {
                setMessageText('');
                setMessages(prev => [...prev, message]);
            },
            error => console.log('Message sending failed:', error)
        )
    }

    useEffect(() => {
        const locationState = location.state as { user?: any };
        if (locationState?.user) {
            setUser(locationState.user);
        }

        getUser();

        const listenerID = 'listener_id_' + uuid();
        CometChat.addMessageListener(
            listenerID,
            new CometChat.MessageListener({
                onTextMessageReceived: (textMessage: any) => {
                   setMessages(prev => [...prev, textMessage]);
                   setTimeout(scrollToBottom, 100);
                }
            })
        )
    }, [])
    useEffect(() => {
        scrollToBottom();
    },[messages]);

    const joinGroup = () => {
        const GUID = receiverID;
        const groupType = CometChat.GROUP_TYPE.PUBLIC;
        const password = "";
        const groupName = "Super Group";
        const group = new CometChat.Group(GUID, groupName, groupType);

        CometChat.createGroup(group).then(
            (createdGroup) => {
                console.log("группа создана", createdGroup);

                CometChat.joinGroup(GUID).then(
                    () => {
                        console.log("Присоединились к группе");
                        fetchMessages();
                    },
                    (error) => {
                        if (error.code === 'ERR_ALREADY_JOINED') {
                            console.log("Уже в группе");
                            fetchMessages();
                        }
                    }
                );
            },
            (error) => {
                if (error.code === "ERR_GUID_ALREADY_EXISTS") {
                    console.log("Группа уже существует, присоединяемся");

                    CometChat.joinGroup(GUID).then(
                        () => {
                            console.log("Присоединились к существующей группе");

                            fetchMessages();
                        },
                        (joinError) => {
                            if (joinError.code === "ERR_ALREADY_JOINED") {
                                console.log("Уже в группе находиься");
                                fetchMessages();
                            } else {
                                console.log("Ошибка присоединения:", joinError)
                            }
                        }
                    );
                } else {
                    console.log("Ошибка создания группы:", error)
                }
            }
        )
    }



    const reAuthenticateUserWithToken = (token?: string) => {
        const authToken = token || localStorage.getItem('cometchat: authToken');
        if (!authToken) return;

        CometChat.login(authToken).then(
            user => {
                console.log("Пользователь залогинен:", user)
                setUser(user)
                joinGroup();
            },
            error => console.log("login failed", error)
        )
    }

    const logout = () => {
        CometChat.logout().then(() => {
            localStorage.removeItem('cometchat: authToken');
            setRedirect(true)
        });
    }


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessageText(e.target.value);
    }

    const scrollToBottom = () => {
        const page = document.querySelector('.page');
        if (page) {
            page.scrollTop = page.scrollHeight;
            //браузере говоришь перемести верхнюю границу видимой области в самую нижнюю якобы приравнивая
        }
    }

    const fetchMessages = () => {
        const limit = 20;
        const messageRequest = new CometChat.MessagesRequestBuilder()
            .setGUID(receiverID)
            .setLimit(limit)
            .build();

        messageRequest.fetchPrevious().then(
            messages => {
                setMessages([...messages]);
                setTimeout(scrollToBottom, 100)
            },
            error => console.log('Message fetching failed', error)
        )
    }



    const getUser = () => {
        CometChat.getLoggedinUser().then(
            user => {
                if (user) {
                    joinGroup();
                } else {
                    reAuthenticateUserWithToken();
                }
            },
            () => {
                const authToken = localStorage.getItem('cometchat: authToken');
                if (authToken) {
                    reAuthenticateUserWithToken(authToken);
                    //если пользователь зареган его пускает,если нет 
                    // попытается помочь ему войти с помощью ключа токена 
                    // а если ничего нет то перенаправляет с помощью навигейт на страницу с регистрацией
                } else {
                    setRedirect(true);
                }
            }
        )
    }


   
        if (redirect) return <Navigate to='/' />;

        return (
            <div className='bg-light page' style={{ height: '100vh', overflowY: 'auto' }}>
                <Container>
                    <Row>
                        <Col>
                            <div className='d-flex align-items-center justify-content-between'>
                                <h3 className='py-3'>React Anonymous Chat</h3>
                                <Button onClick={logout} variant='outline-primary'>Logout</Button>
                            </div>

                            <ul className='list-group' style={{ marginBottom: '80px' }}>
                                {messages.length > 0 ? (
                                    messages.map((msg: any) => (
                                        <li className='list-group-item' key={msg.id || uuid()}>
                                            <strong>{msg.sender?.name || 'Unknown'}: </strong>
                                            <span>{msg.text}</span>
                                        </li>
                                    ))
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
