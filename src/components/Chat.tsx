import React from "react";
import type { ChatState } from "../types/chat";
import { v4 as uuid } from 'uuid';
import { Navigate } from "react-router-dom";
import { Row, Col, Container, Form, Button, Navbar } from 'react-bootstrap';
import { CometChat } from "@cometchat/chat-sdk-javascript"; 

class Chat extends React.Component<any, ChatState> {
    state: ChatState = {
        redirect: false,
        user: null,
        receiverID: 'supergroup',
        messageText: '',
        messages: [],
        authToken: null,
        messageType: CometChat.MESSAGE_TYPE.TEXT,
        receiverType: CometChat.RECEIVER_TYPE.GROUP,
        groupType: CometChat.GROUP_TYPE.PUBLIC,
        
    }
     joinGroup = () => {
        const GUID = this.state.receiverID;
        const groupType = CometChat.GROUP_TYPE.PUBLIC;
        const password = "";
        const groupName = "Super Group";
        const group = new CometChat.Group(GUID,groupName,groupType);

        CometChat.createGroup(group).then(
            (createdGroup) => {
                console.log("группа создана", createdGroup);

                CometChat.joinGroup(GUID).then(
                    () => {
                        console.log("Присоединились к группе");
                        this.fetchMessages();
                    },
                    (error) => {
                        if(error.code === 'ERR_ALREADY_JOINED'){
                            console.log("Уже в группе");
                            this.fetchMessages();
                        }
                    }
                );
            },
            (error) => {
                if(error.code === "ERR_GUID_ALREADY_EXISTS"){
                    console.log("Группа уже существует, присоединяемся");

                    CometChat.joinGroup(GUID).then(
                        () => {
                            console.log("Присоединились к существующей группе");

                            this.fetchMessages();
                        },
                        (joinError) => {
                            if(joinError.code === "ERR_ALREADY_JOINED"){
                                console.log("Уже в группе находиься");
                                this.fetchMessages();
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

    componentDidMount(): void {
        if (this.props.location?.state?.user) {
            this.setState({ user: this.props.location.state.user });
        }
        this.getUser();
        this.receiveMessages();
    }

    reAuthenticateUserWithToken = (token?: string) => {
        const authToken = token || localStorage.getItem('cometchat: authToken');
        if (!authToken) return;

        CometChat.login(authToken).then(
            user => {
                console.log("Пользователь залогинен:", user)
                this.setState({ user });
                this.joinGroup();
            },
            error => console.log("login failed", error)
        )
    }

    logout = () => {
        CometChat.logout().then(() => {
            localStorage.removeItem('cometchat: authToken');
            this.setState({ redirect: true })
        });
    }

    receiveMessages = () => {
        const listenerID = 'listener_id_' + uuid();
        CometChat.addMessageListener(
            listenerID,
            new CometChat.MessageListener({
                onTextMessageReceived: (textMessage: any) => {
                    this.setState(prevState => ({
                        messages: [...prevState.messages, textMessage]
                    }), () => this.scrollToBottom())
                }
            })
        )
    }

    handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ messageText: e.target.value })
    }

    scrollToBottom = () => {
        const page = document.querySelector('.page');
        if(page){
            page.scrollTop = page.scrollHeight;
            //браузере говоришь перемести верхнюю границу видимой области в самую нижнюю якобы приравнивая
        }
    }

    fetchMessages = () => {
        const GUID = this.state.receiverID;
        const limit = 20;
        const messageRequest = new CometChat.MessagesRequestBuilder()
        .setGUID(GUID)
        .setLimit(limit)
        .build();

        messageRequest.fetchPrevious().then(
            messages => {
                this.setState({ messages: [...messages]}, () => this.scrollToBottom());
            },
            error => console.log('Message fetching failed', error)
        )
    }

   

    getUser = () => {
        CometChat.getLoggedinUser().then(
            user => {
                if(user){
                    this.joinGroup();
                }else{
                    this.reAuthenticateUserWithToken();
                }
            },
            () => {
                const authToken = localStorage.getItem('cometchat: authToken');
                if(authToken){
                    this.reAuthenticateUserWithToken(authToken);
                    //если пользователь зареган его пускает,если нет 
                    // попытается помочь ему войти с помощью ключа токена 
                    // а если ничего нет то перенаправляет с помощью навигейт на страницу с регистрацией
                } else {
                    this.setState({ redirect: true})
                }
            }
        )
    }


    sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        const { receiverID, messageText, receiverType } = this.state;

        const textMessage = new CometChat.TextMessage(
            receiverID,
            messageText,
            receiverType
        );

        
        CometChat.sendMessage(textMessage).then(
            message => {
                this.setState(prevState => ({
                    messageText: '',
                    messages: [...prevState.messages, message]
                }), () => this.scrollToBottom())
            },
            error => {
                console.log('Message sending failed:', error)
            }
        )
    }
  render() {
        if (this.state.redirect) return <Navigate to='/' />;

        return (
            <div className='bg-light page' style={{ height: '100vh', overflowY: 'auto' }}>
                <Container>
                    <Row>
                        <Col>
                            <div className='d-flex align-items-center justify-content-between'>
                                <h3 className='py-3'>React Anonymous Chat</h3>
                                <Button onClick={this.logout} variant='outline-primary'>Logout</Button>
                            </div>

                            <ul className='list-group' style={{ marginBottom: '80px' }}>
                                {this.state.messages.length > 0 ? (
                                    this.state.messages.map((msg: any) => (
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
                        <Form className='w-100 d-flex gap-2' onSubmit={this.sendMessage}>
                            <Form.Control
                                value={this.state.messageText}
                                required
                                placeholder='Type Message here...'
                                onChange={this.handleChange}
                            />
                            <Button variant='primary' type='submit'>Send</Button>
                        </Form>
                    </Container>
                </Navbar>
            </div>
        );
    }
}

export default Chat;
