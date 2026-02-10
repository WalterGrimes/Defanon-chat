import React, { useEffect, useState } from "react";
import { v4 as uuid } from 'uuid';
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { Row, Col, Container, Form, Button, Navbar } from 'react-bootstrap';
import { CometChat } from "@cometchat/chat-sdk-javascript";

function Chat() {
    const { guid } = useParams<{ guid: string }>(); //Достать айди группы
    const [redirect, setRedirect] = useState(false);
    const [user, setUser] = useState<CometChat.User | null>(null);
    const [messageText, setMessageText] = useState<string>('');
    const [messages, setMessages] = useState<CometChat.BaseMessage[]>([]);
    const receiverType = CometChat.RECEIVER_TYPE.GROUP;
    const navigate = useNavigate();

    const location = useLocation();

    if (!guid) {
        return <Navigate to='/chatboxes' />
    }

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageText.trim() || !guid) return;

        const textMessage = new CometChat.TextMessage(
            guid,
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
        if (guid) {
            CometChat.getGroup(guid).then(
                (group) => {
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

        getUser();

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

    useEffect(() => {
        scrollToBottom();
    }, [messages])

    const joinGroup = () => {
        const GUID = guid;

        CometChat.getGroup(GUID).then(
            (existingGroup) => {
                console.log("группа создана", existingGroup);

                const groupType = existingGroup.getType() as CometChat.GroupType;

                CometChat.joinGroup(GUID, groupType).then(
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
                console.error('ГРуппа не нашлась', error);
                alert('Группа не существует')
                navigate('/chatboxes');
            }
        )
    }



    const reAuthenticateUserWithToken = (token?: string) => {
        const authToken = token || localStorage.getItem('cometchat:authToken');
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
            navigate('/')
            localStorage.removeItem('cometchat: authToken');
            setRedirect(true)
        });
    }

    const leaveRoom = () => {
        const GUID = guid;

        CometChat.leaveGroup(GUID).then(
            () => {
                console.log("Успешно покинуто")

                setMessages([])
                setMessageText("");
                navigate('/chatboxes')
            },
            error => {
                console.log("Ошибка", error)
                navigate('/chatboxes')
            }
        )
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
            .setGUID(guid)
            .setLimit(limit)
            .build();

        messageRequest.fetchPrevious().then(
            messages => {
                console.log(`Кол-во сообщении ${messages.length}`);
                setMessages([...messages]);
                setTimeout(scrollToBottom, 100)
            },
            error => {
                console.log('Message fetching failed', error)
                alert("Ошибка входа: " + error.message);
            }
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
    if (!user && !localStorage.getItem('cometchat:authToken')) {
        console.log("No user found")//Проверка на нового пользователя
    }

    return (
        <div className='bg-light page' style={{ height: '100vh', overflowY: 'auto' }}>
            <Container>
                <Row>
                    <Col>
                        <div className='d-flex align-items-center justify-content-between'>
                            <h3 className='py-3'>
                                Welcome to default chat dear {user ? `- ${(user as any).name || (user as any).uid || 'Guest'}` : '- Loading...'}
                            </h3>
                            <Button onClick={logout} variant='outline-primary'>Logout</Button>
                        </div>
                        <div className='d-flex align-items-center justify-content-between'>
                            <Button onClick={leaveRoom} variant='outline-primary'>Leave basic group</Button>
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