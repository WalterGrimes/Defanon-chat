import { useEffect, useState } from "react";
import { CometChat } from "@cometchat/chat-sdk-javascript"; import { Container, Row, Card, Col, Button, Modal, Form } from "react-bootstrap";
import BoxStatus from "./BoxStatus";
import CreateBox from "./CreateBox";
import PasswordField from "../PasswordField";
import { useChatActionsForChatBoxes } from "../../hooks/useChatActionForChatBoxes";
import { GreenLoader, RedLoader } from "../../features/Loaders";
import { useChatActionsForSignChat } from "../../hooks/useChatActionsForSignChat";
import { useAuth } from "../../context/ChatContext";
import EditBox from "./EditBox";
import { useChatActionsForChat } from "../../hooks/useChatActionsForChat";
import './ChatBoxes.css';

const ChatBoxes = () => {
    const { groups, setGroups,
        selectedGroupId,
        password, setPassword,
        isVisible, hide,
        enterChat, handleDeleteGroup, handleJoin,
        handleNewGroup, handleGroupSettingsUpdate,
        isJoining, isDeletingGroup,
        showingOwnerHisGroup
    } = useChatActionsForChatBoxes();

    const { logout,
        isLoggingOut, isNuking,
        nukeEverything } = useChatActionsForSignChat();

    const { guid, messages } = useChatActionsForChat();


    const [isLoading, setIsLoading] = useState(true);
    const [loggedInUid, setLoggedInUid] = useState<string>("");
    const [onlineRightNow, setOnlineRightNow] = useState<number>(0);

    const { user } = useAuth();

    useEffect(() => {
        if (guid) {

            CometChat.getOnlineGroupMemberCount([guid]).then(
                (result: any) => {
                    const count = result[guid];
                    setOnlineRightNow(count || 0);
                },
                (error) => {
                    console.log('Ошибка', error);
                }
            );
        }
    }, [guid, messages]);

    useEffect(() => {
        CometChat.getLoggedInUser().then((user) => {
            if (user) setLoggedInUid(user.getUid())
        })
    }, [])

    useEffect(() => {
        const limit = 30;
        const groupsRequest = new CometChat.GroupsRequestBuilder()
            .setLimit(limit)
            .build();

        groupsRequest.fetchNext().then(
            (groupList: CometChat.Group[]) => {
                const sortedList = [...groupList].sort((a, b) => b.getCreatedAt() - a.getCreatedAt());
                setGroups(sortedList);
                setIsLoading(false);
            },
            (error: CometChat.CometChatException) => {
                console.error("Groups fetching failed:", error);
                setIsLoading(false);
            }
        );

        const listenerId = "listenerOfGroups";
        CometChat.addGroupListener(
            listenerId,
            new CometChat.GroupListener({
                onGroupCreated: (group: CometChat.Group) => {
                    handleNewGroup(group);
                },
                onGroupDeleted: (group: CometChat.Group) => {
                    setGroups(prev => prev.filter(item => item.getGuid() !== group.getGuid()));
                }
            })
        );

        return () => CometChat.removeGroupListener(listenerId);
    }, []);


    if (isLoading) {
        return <GreenLoader message="Loading boxes, please wait..." />
    }

    if (isLoggingOut) {
        return <RedLoader message="Logging out, please wait..." />
    }

    if (isJoining) {
        return <GreenLoader message="Joining the chat, please wait..." />
    }

    if (isDeletingGroup) {
        return <RedLoader message="Deleting the group, please wait..." />
    }

    if (isNuking) {
        return <RedLoader message="Pls wait...Deleting your data,messages,everything..." />
    }


    return (
        <>
            <div className='d-flex gap-2 align-items-center ms-3 ' style={{ height: '5vh', overflowY: 'auto' }}>
                {`Welcome,${user?.getName()}`}
            </div>
            <div className='d-flex gap-2 align-items-center ms-3 ' style={{ height: '5vh', overflowY: 'auto' }}>
                <Button onClick={logout} variant='outline-primary' style={{ marginRight: '12px' }}> Logout</Button>
            </div>
            <div className='d-flex gap-2 align-items-center ms-3 ' style={{ height: '5vh', overflowY: 'auto' }}>
                <Button onClick={() => nukeEverything(loggedInUid)} variant='danger' style={{ marginRight: '12px' }}>Delete</Button>
            </div>

            <Container className="mt-4">
                <div className="d-flex justify-content-end mb-4">
                    <CreateBox onGroupCreate={handleNewGroup} />
                </div>
                <Row xs={1} md={2} lg={3} className="g-4">
                    {groups.map((group) => (
                        <Col key={group.getGuid()}>
                            {group.getGuid() === showingOwnerHisGroup && (
                                <div className="new-box-pointer-container">
                                    <div className="new-box-badge">your new box is here (◣_◢)</div>
                                </div>
                            )}
                            <Card className="h-100 shadow-sm border-0 bg-dark text-white">
                                <Card.Body className="d-flex flex-column text-center">
                                    <Card.Title className="mb-3">{group.getName()}</Card.Title>
                                    <Card.Text className="small text-muted mb-4">
                                        ID: {group.getGuid()} <br />
                                        Участников: {group.getMembersCount()} <br />
                                        Дата создания: {new Date(group.getCreatedAt() * 1000).toLocaleDateString()} <br />
                                        Users online: {onlineRightNow} <br />
                                        {group.getOwner() === loggedInUid && (
                                            <>
                                                <div>Вы являетесь создателем данной комнаты</div>
                                                <EditBox group={group} onGroupUpdate={handleGroupSettingsUpdate} />

                                            </>
                                        )}
                                    </Card.Text>
                                    <Button variant="outline-light"
                                        className="mt-auto"
                                        onClick={() => enterChat(group)}>
                                        Войти в коробку
                                    </Button>
                                    {group.getOwner() === loggedInUid && (
                                        <>
                                            <Button variant="danger" className="mt-2" onClick={() => handleDeleteGroup(group.getGuid())}>
                                                Удалить коробку
                                            </Button>

                                        </>
                                    )}
                                    <div className="mt-2 d-flex justify-content-center">
                                        <BoxStatus type={group.getType()} />
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container>
            <Modal show={isVisible} onHide={hide} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Write a password</Modal.Title>
                </Modal.Header>

                <Form onSubmit={(e) => {
                    e.preventDefault();
                    if (selectedGroupId) {
                        handleJoin(selectedGroupId, password);
                    }
                }}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Password</Form.Label>
                            <PasswordField
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Введите пароль"
                            />
                        </Form.Group>

                        <Button
                            variant="primary"
                            className="w-100"
                            type="submit">
                            Enter
                        </Button>
                    </Modal.Body>
                </Form>
            </Modal>
        </>
    );
};

export default ChatBoxes;