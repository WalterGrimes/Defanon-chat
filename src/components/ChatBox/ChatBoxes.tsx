import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CometChat } from "@cometchat/chat-sdk-javascript";
import { Container, Spinner, Row, Card, Col, Button, Modal, Form } from "react-bootstrap";
import BoxStatus from "./BoxStatus";
import CreateBox from "./CreateBox";
import { useModal } from "../../hooks/useModal";
import PasswordField from "../PasswordField";

const ChatBoxes = () => {
    const [groups, setGroups] = useState<CometChat.Group[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const { isVisible, show, hide } = useModal();
    const [password, setPassword] = useState<string>('');



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

    const handleNewGroup = (newGroup: CometChat.Group) => {
        setGroups(prev => {
            const updatedList = [newGroup, ...prev];
            return updatedList.sort((a, b) => b.getCreatedAt() - a.getCreatedAt());
        });
    };

    const enterChat = (guid: string) => {
        const trimmedPassword = password.trim();
        show();

        CometChat.joinGroup(guid).then(
            (group) => {
                console.log("Joined successfully:", group);
                navigate(`/chat/${guid}`);
            },
            (error) => {
                if (error.code === "ERR_ALREADY_JOINED") {
                    navigate(`/chat/${guid}`);
                } else {
                    console.error("Join failed:", error);
                    // alert("Failed to join the box. Maybe it's private?");
                }
            }
        );
    };

    const handleDeleteGroup = (GUID: string) => {
        if (!window.confirm("Are you sure you want to delete this box?")) return;

        CometChat.deleteGroup(GUID).then(
            () => {
                setGroups(prev => prev.filter(item => item.getGuid() !== GUID));
            },
            (error: CometChat.CometChatException) => {
                console.error("Delete failed:", error);
                alert("Only the owner can delete this box!");
            }
        );
    };

    if (isLoading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" variant="success" />
                <p className="mt-3">Loading boxes, please wait...</p>
            </Container>
        );
    }

    const handleClose = () => {
        hide();
    }

    return (
        <>
            <Container className="mt-4">
                <div className="d-flex justify-content-end mb-4">
                    <CreateBox onGroupCreate={handleNewGroup} />
                </div>

                <h2 className="mb-4 text-center text-uppercase" style={{ letterSpacing: '2px' }}>
                    Select a Box
                </h2>

                <Row xs={1} md={2} lg={3} className="g-4">
                    {groups.map((group) => (
                        <Col key={group.getGuid()}>
                            <Card className="h-100 shadow-sm border-0 bg-dark text-white">
                                <Card.Body className="d-flex flex-column text-center">
                                    <Card.Title className="mb-3">{group.getName()}</Card.Title>
                                    <Card.Text className="small text-muted mb-4">
                                        ID: {group.getGuid()} <br />
                                        Участников: {group.getMembersCount()} <br />
                                        Дата создания: {new Date(group.getCreatedAt() * 1000).toLocaleDateString()}
                                    </Card.Text>

                                    <Button variant="outline-light" className="mt-auto" onClick={() => enterChat(group.getGuid())}>
                                        Войти в коробку
                                    </Button>



                                    <Button variant="danger" className="mt-2" onClick={() => handleDeleteGroup(group.getGuid())}>
                                        Удалить коробку
                                    </Button>

                                    <div className="mt-2 d- flex justify-content-center">
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
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Password</Form.Label>
                        <PasswordField value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Введите пароль"/>
                    </Form.Group>
                </Modal.Body>

            </Modal>
        </>
    );
};

export default ChatBoxes;