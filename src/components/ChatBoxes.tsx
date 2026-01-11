import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import { CometChat } from "@cometchat/chat-sdk-javascript";
import { Container, Spinner,Row,Card,Col,Button } from "react-bootstrap";

const ChatBoxes = () => {
    const [groups, setGroups] = useState<CometChat.Group[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const limit = 30;
        const groupRequest = new CometChat.GroupsRequestBuilder()
        .setLimit(limit)
        .build();

        groupRequest.fetchNext().then(//Пагинатор
            (groupList: any) => {
                setGroups(groupList);
                setIsLoading(false)
            },
            (error: any) => {
                console.error("Ошибка",error)
                setIsLoading(false);
            }
        )
    }, [])

    const enterChat = (guid: string) => {
        navigate(`/chat/${guid}`);
    }
    
    if(isLoading){
        return(
            <Container className="text-center mt-5">
                <Spinner animation="border" />
                <p>Загрузка коробок</p>
            </Container>
        )
    }

    return (
        <Container className="mt-4">
            <h2 className="mb-4 text-center text-uppercase" style={{letterSpacing: '2px'}}>Выберите коробку</h2>
            <Row>
                {groups.map((group) => (
                    <Col key={group.getGuid()} className="mb-4">
                        <Card className="h-100 shadow-sm border-0 bg-dark text-white">
                            <Card.Body className="d-flex flex-column text-center">
                                <Card.Title className="mb-3">{group.getName()}</Card.Title>
                                <Card.Text className="small text-muted mb-4">
                                    ID: {group.getGuid()} <br/>
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