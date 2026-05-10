import { useEffect, useState } from "react";
import { CometChat } from "@cometchat/chat-sdk-javascript";
import { Container, Row, Card, Col, Button, Modal, Form } from "react-bootstrap";
import BoxStatus from "../BoxStatus";
import CreateBox from "../CreateBox";
import PasswordField from "../../PasswordField";
import { useChatActionsForChatBoxes } from "../../../hooks/useChatActionForChatBoxes";
import { GreenLoader, RedLoader } from "../../../features/Loaders";
import { useChatActionsForSignChat } from "../../../hooks/useChatActionsForSignChat";
import { useAuth } from "../../../context/ChatContext";
import EditBox from "../EditBox";
import { useChatActionsForChat } from "../../../hooks/useChatActionsForChat";
import { GroupInfoModal } from "../../GroupInfoModal/GroupInfioModal";
import { getUserColor } from "../../../utilits/ColorHelper";
import { Pagination } from "../../Pagination/Pagination";
import { ThemeSwitcher } from "../../../ThemeChange/ThemeSwitcher";
import s from './ChatBoxes.module.css';
import '../ChatBoxes.css';
import { FavoriteBox } from "../../FavoriteBox";
import { BsBoxArrowRight } from "react-icons/bs";
import { BsDoorOpen } from "react-icons/bs";

const ChatBoxes = () => {
    const {
        groups, setGroups,
        selectedGroupId,
        password, setPassword,
        isVisible, hide,
        enterChat, handleDeleteGroup, handleJoin,
        handleNewGroup, handleGroupSettingsUpdate,
        isJoining, isDeletingGroup,
        showingOwnerHisGroup
    } = useChatActionsForChatBoxes();

    const {
        logout,
        isLoggingOut, isNuking,
        nukeEverything
    } = useChatActionsForSignChat();

    const { guid, messages } = useChatActionsForChat();

    const [isLoading, setIsLoading] = useState(true);
    const [loggedInUid, setLoggedInUid] = useState<string>("");
    const [onlineRightNow, setOnlineRightNow] = useState<number>(0);

    const { user } = useAuth();

    const [infoGroup, setInfoGroup] = useState<CometChat.Group | null>(null);
    const [isInfoVisible, setIsInfoVisible] = useState(false);

    const userColor = getUserColor(user?.getUid() || "unknown");

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 8;

    const openInfo = (group: CometChat.Group) => {
        setInfoGroup(group);
        setIsInfoVisible(true);
    };

    const [activeFilter, setActiveFilter] = useState<'all' | 'fav'>('all');
    const [refreshFavs, setRefreshFavs] = useState(0);

    useEffect(() => {
        const handleUpdate = () => setRefreshFavs(prev => prev + 1);
        window.addEventListener('favUpdated', handleUpdate);
        return () => window.removeEventListener('favUpdated', handleUpdate);
    }, []);

    const filtered = groups.filter(group => {
        if (activeFilter === 'all') return true;
        const favs: string[] = JSON.parse(localStorage.getItem('fav_boxes') || '[]');
        return favs.includes(group.getGuid());
    });

    const startPagination = (currentPage - 1) * pageSize;
    const paginationGroups = filtered.slice(startPagination, startPagination + pageSize);

    const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

    useEffect(() => {
        const observer = new MutationObserver(() => {
            setTheme(document.documentElement.getAttribute("data-theme") || "light");
        });
        observer.observe(document.documentElement, { attributes: true });
        return () => observer.disconnect();
    }, []);

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
            if (user) setLoggedInUid(user.getUid());
        });
    }, []);

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

    if (isLoading) return <GreenLoader message="Loading boxes, please wait..." />;
    if (isLoggingOut) return <RedLoader message="Logging out, please wait..." />;
    if (isJoining) return <GreenLoader message="Joining the chat, please wait..." />;
    if (isDeletingGroup) return <RedLoader message="Deleting the group, please wait..." />;
    if (isNuking) return <RedLoader message="Pls wait...Deleting your data,messages,everything..." />;

    return (
        <div className={s.chatWrapper}>
            <div className={s.header}>
                <div className={s.headerLeft}>
                    <span>Welcome, </span>
                    <span style={{ color: userColor }}>{user?.getName()}</span>
                </div>
                <div className={s.headerRight}>
                    <ThemeSwitcher />
                    <Button
                        onClick={logout}
                        variant={theme === 'light' ? 'outline-dark' : 'outline-light'}
                        className={s.logoutBtn}
                    >
                        <BsBoxArrowRight size={16} />
                    </Button>
                    <Button onClick={() => nukeEverything(loggedInUid)} variant='danger'>Delete</Button>
                </div>
            </div>

            <Container className="mt-4">
                <div className="d-flex justify-content-end mb-4">
                    <CreateBox onGroupCreate={handleNewGroup} />
                </div>

                <div className="d-flex gap-2 mb-4">
                    <Button
                        variant={activeFilter === 'all' ? 'primary' : 'outline-primary'}
                        onClick={() => setActiveFilter('all')}
                    >
                        Все коробки
                    </Button>
                    <Button
                        variant={activeFilter === 'fav' ? 'warning' : 'outline-warning'}
                        onClick={() => setActiveFilter('fav')}
                    >
                        Избранное
                    </Button>
                </div>

                <GroupInfoModal
                    show={isInfoVisible}
                    onHide={() => setIsInfoVisible(false)}
                    group={infoGroup}
                />

                <Row xs={1} md={2} lg={4} className="g-5 gy-5">
                    {paginationGroups.map((group) => (
                        <Col key={group.getGuid()}>
                            {group.getGuid() === showingOwnerHisGroup && (
                                <div className="new-box-pointer-container">
                                    <div className="new-box-badge">your new box is here (◣_◢)</div>
                                </div>
                            )}
                            <Card className={`h-100 shadow-sm border-0 bg-dark text-white group-card-relative ${s.card}`}>
                                <FavoriteBox guid={group.getGuid()} />
                                <button
                                    className={`info-icon-btn ${group.getOwner() === loggedInUid ? 'info-icon-center' : ''}`}
                                    onClick={() => openInfo(group)}
                                    title="Подробнее о коробке"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                                    </svg>
                                </button>
                                {group.getOwner() === loggedInUid && (
                                    <EditBox group={group} onGroupUpdate={handleGroupSettingsUpdate} />
                                )}
                                <Card.Body className="d-flex flex-column text-center p-3" style={{ paddingBottom: '60px' }}>
                                    <Card.Title className={s.cardTitle}>{group.getName()}</Card.Title>

                                    <div className={s.doorWrapper} onClick={() => enterChat(group)} title="Войти в коробку">
                                        <BsDoorOpen size={36} />
                                    </div>

                                    <Card.Text className={s.cardStats}>
                                        Участников: {group.getMembersCount()} <br />
                                        Users online: {onlineRightNow}
                                    </Card.Text>

                                    {group.getOwner() === loggedInUid && (
                                        <small className={s.ownerBadge}>Вы владелец</small>
                                    )}

                                    <div style={{ position: 'absolute', bottom: '16px', left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
                                        <BoxStatus type={group.getType()} />
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>

                <div className="d-flex justify-content-center mt-5 mb-4">
                    <Pagination
                        currentPage={currentPage}
                        totalGroups={filtered.length}
                        pageSize={pageSize}
                        onPageChange={(page: number) => setCurrentPage(page)}
                    />
                </div>
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
                        <Button variant="primary" className="w-100" type="submit">
                            Enter
                        </Button>
                    </Modal.Body>
                </Form>
            </Modal>
        </div>
    );
};

export default ChatBoxes;