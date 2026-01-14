import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import { CometChat } from "@cometchat/chat-sdk-javascript";
import { Container, Spinner, Row, Card, Col, Button } from "react-bootstrap";
import CreateBox from "./CreateBox";

export interface handleNewGroupProps {
    onGroupCreate: (newGroup: CometChat.Group) => void;
}


const ChatBoxes = () => {
    const [group,setGroup] = useState<CometChat.Group[]>([])
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const limit = 30;
        const groupRequest = new CometChat.GroupsRequestBuilder()
            .setLimit(limit)
            .build();

        groupRequest.fetchNext().then(//Пагинатор
            (groupList: any) => {
                setGroup(groupList);
                setIsLoading(false)
            },
            (error: any) => {
                console.error("Ошибка", error)
                setIsLoading(false);
            }
        )
    }, [])

    useEffect(() => {
        const listenerId = "listenerOfGroups"

        CometChat.addGroupListener(
            listenerId,
            new CometChat.GroupListener({
                onGroupCreated: (group: CometChat.Group) => {
                    console.log("Человек создал комнату", group);
                    handleNewGroup(group)
                }
            })
        )
        return () => CometChat.removeGroupListener(listenerId);
    }, [])
    

    const enterChat = (guid: string) => {
        navigate(`/chat/${guid}`);
    }

    const handleNewGroup = (newGroup: CometChat.Group) => {
        setGroup(prev =>{
            const updateList =  [newGroup, ...prev];

            updateList.sort((a,b) => b.getCreatedAt() - a.getCreatedAt())
            //особенность сорта,если положительное число,то ставит б на первое место
            return updateList;
        })
    }

    if (isLoading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" />
                <p>Загрузка коробок</p>
            </Container>
        )
    }

    return (
        <Container className="mt-4">
            <div className="d-flex justify-content-end mb-4">
                <CreateBox onGroupCreate={handleNewGroup} />
            </div>
            <h2 className="mb-4 text-center text-uppercase" style={{ letterSpacing: '2px' }}>Выберите коробку</h2>
            <Row>
                {group.map((group) => (
                    <Col key={group.getGuid()} className="mb-4">
                        <Card className="h-100 shadow-sm border-0 bg-dark text-white">
                            <Card.Body className="d-flex flex-column text-center">
                                <Card.Title className="mb-3">{group.getName()}</Card.Title>
                                <Card.Text className="small text-muted mb-4">
                                    ID: {group.getGuid()} <br />
                                    Участников: {group.getMembersCount()}
                                </Card.Text>
                                <Button
                                    variant="outline-light"
                                    className="mt-auto"
                                    onClick={() => enterChat(group.getGuid())}
                                >
                                    Войти в коробку

                                </Button>                   
                             </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    )
}

export default ChatBoxes;