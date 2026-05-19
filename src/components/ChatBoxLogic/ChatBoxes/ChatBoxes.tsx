import { useEffect, useState } from "react";
import { CometChat } from "@cometchat/chat-sdk-javascript";
import { Container, Row, Card, Col, Button, Modal, Form } from "react-bootstrap";
import BoxStatus from "../BoxStatus/BoxStatus";
import CreateBox from "../CreateBox/CreateBox";
import PasswordField from "../../Login/PasswordField";
import { useChatActionsForChatBoxes } from "../../../hooks/useChatActionForChatBoxes";
import { DeleteLoader, GreenLoader, RedLoader } from "../../../utilits/Preloader/Loaders";
import { useChatActionsForSignChat } from "../../../hooks/useChatActionsForSignChat";
import { useAuth } from "../../../context/ChatContext";
import EditBox from "../EditBox/EditBox";
import { useChatActionsForChat } from "../../../hooks/useChatActionsForChat";
import { GroupInfoModal } from "../../GroupInfoModal/GroupInfioModal";
import { getUserColor } from "../../../utilits/ColorHelper";
import { Pagination } from "../../Pagination/Pagination";
import { ThemeSwitcher } from "../../../ThemeChange/ThemeSwitcher";
import s from './ChatBoxes.module.css';
import '../ChatBoxes.css';
import { FavoriteBox } from "../../FavoriteBox/FavoriteBox";
import { BsBoxArrowRight, BsDoorOpen, BsDoorClosed, BsTrash, BsStarFill, BsStar, BsGrid3X3Gap } from "react-icons/bs";
import { DiagonalLines, InfoIcon } from "../../../utilits/SomeStuff";
import { NukeBtn } from "../../../utilits/NukeBtn/NukeBtn";
import { SearchBox } from "../SearchBox/SearchBox";

const HOVER_COLORS = ['#7ba8f5', '#4ade80', '#f472b6', '#fb923c', '#a78bfa', '#34d399', '#f87171', '#facc15'];

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

    const [deleteGuid, setDeleteGuid] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const openInfo = (group: CometChat.Group) => {
        setInfoGroup(group);
        setIsInfoVisible(true);
    };

    const [activeFilter, setActiveFilter] = useState<'all' | 'fav'>('all');
    const [refreshFavs, setRefreshFavs] = useState(0);
    const [hoveredGuid, setHoveredGuid] = useState<string | null>(null);
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

    const [deletingGuid, setDeletingGuid] = useState<string | null>(null);

    const getHoverColor = (guid: string) => {
        const index = groups.findIndex(g => g.getGuid() === guid);
        return HOVER_COLORS[index % HOVER_COLORS.length];
    };

    useEffect(() => {
        const handleUpdate = () => setRefreshFavs(prev => prev + 1);
        window.addEventListener('favUpdated', handleUpdate);
        return () => window.removeEventListener('favUpdated', handleUpdate);
    }, []);

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
    // if (isDeletingGroup) return <DeleteLoader message="Deleting the group, please wait..." />;
    if (isNuking) return <RedLoader message="Pls wait...Deleting your data,messages,everything..." />;

    const filtered = groups.filter(group => {
        if (activeFilter === 'fav') {
            const favs: string[] = JSON.parse(localStorage.getItem('fav_boxes') || '[]');
            if (!favs.includes(group.getGuid())) return false;
        }
        if (searchQuery.trim()) {
            return group.getName().toLowerCase().includes(searchQuery.toLowerCase());
        }
        return true;
    });
    const startPagination = (currentPage - 1) * pageSize;
    const paginationGroups = filtered.slice(startPagination, startPagination + pageSize);

    return (
        <div className={s.chatWrapper}>
            <div className={s.header}>
                <div className={s.headerLeft}>
                    <span className={s.welcomeText}>Welcome, </span>
                    <span className={s.welcomeName} style={{ color: userColor }}>{user?.getName()}</span>
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
                    <div style={{ marginLeft: '16px' }}>
                        <NukeBtn onClick={() => nukeEverything(loggedInUid)} />
                    </div>
                </div>
                {/* <div className={s.nukeBtnWrapper}>
                    <NukeBtn onClick={() => nukeEverything(loggedInUid)} />
                </div> */}
            </div>

            <Container className="mt-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className={s.filterGroup}>
                        <button
                            className={`${s.filterBtn} ${activeFilter === 'all' ? s.filterBtnActive : ''}`}
                            onClick={() => setActiveFilter('all')}
                            title="All boxes"
                        >
                            <BsGrid3X3Gap size={18} />
                        </button>
                        <button
                            className={`${s.filterBtn} ${activeFilter === 'fav' ? s.filterBtnFav : ''}`}
                            onClick={() => setActiveFilter('fav')}
                            title="Favourite"
                        >
                            {activeFilter === 'fav' ? <BsStarFill size={18} /> : <BsStar size={18} />}
                        </button>
                        <SearchBox value={searchQuery} onChange={setSearchQuery} theme={theme} />
                    </div>
                    <CreateBox onGroupCreate={handleNewGroup} />
                </div>

                <GroupInfoModal
                    show={isInfoVisible}
                    onHide={() => setIsInfoVisible(false)}
                    group={infoGroup}
                />

                {activeFilter === 'fav' && filtered.length === 0 ? (
                    <div className={s.emptyFav}>
                        <p>You have no favorite boxes</p>
                        <small>Click ★ on a box to add it to favorites</small>
                    </div>
                ) : (
                    <Row className="g-4">
                        {paginationGroups.map((group) => (
                            <Col key={group.getGuid()} xs={12} md={6} lg={3}>
                                {group.getGuid() === showingOwnerHisGroup && (
                                    <div className="new-box-pointer-container">
                                        <div className="new-box-badge">Your new box (◣_◢)</div>
                                    </div>
                                )}
                                <div className={s.cardWrapper}>
                                    {deletingGuid === group.getGuid() && (
                                        <div className={s.cardOverlay}>
                                            <div className="spinner-border text-danger" role="status" style={{ width: '2rem', height: '2rem' }} />
                                            <small className={`${s.cardOverlayText} ${s.cardOverlayTextRed}`}>Deleting...</small>
                                        </div>
                                    )}
                                    <Card
                                        className={`h-100 shadow-sm border-0 bg-dark text-white group-card-relative ${s.card}`}
                                        style={{ '--hover-color': getHoverColor(group.getGuid()) } as React.CSSProperties}
                                    >
                                        <FavoriteBox guid={group.getGuid()} />
                                        <button
                                            className={`info-icon-btn ${group.getOwner() === loggedInUid ? 'info-icon-center' : ''}`}
                                            onClick={() => openInfo(group)}
                                            title="More about the box"
                                        >
                                            <InfoIcon />
                                        </button>
                                        {group.getOwner() === loggedInUid && (
                                            <EditBox
                                                group={group}
                                                onGroupUpdate={handleGroupSettingsUpdate}
                                            />
                                        )}
                                        {group.getOwner() === loggedInUid && (
                                            <button
                                                className="delete-icon-btn"
                                                onClick={() => setDeleteGuid(group.getGuid())}
                                                title="Delete box"
                                            >
                                                <BsTrash size={16} />
                                            </button>
                                        )}

                                        <Card.Body className="d-flex flex-column text-center p-3" style={{ paddingBottom: '60px' }}>
                                            <Card.Title
                                                className={s.cardTitle}
                                                onClick={() => enterChat(group)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                {group.getName()}
                                            </Card.Title>

                                            <div
                                                className={s.doorWrapper}
                                                onClick={() => enterChat(group)}
                                                onMouseEnter={() => setHoveredGuid(group.getGuid())}
                                                onMouseLeave={() => setHoveredGuid(null)}
                                                title="Enter a box"
                                            >
                                                {hoveredGuid === group.getGuid() ? (
                                                    <BsDoorOpen size={36} />
                                                ) : (
                                                    <BsDoorClosed size={36} />
                                                )}
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
                                </div>
                            </Col>
                        ))}
                    </Row>
                )}

                <div className="d-flex justify-content-center mt-5 mb-4">
                    <Pagination
                        currentPage={currentPage}
                        totalGroups={filtered.length}
                        pageSize={pageSize}
                        onPageChange={(page: number) => setCurrentPage(page)}
                    />
                </div>
            </Container>

            <Modal show={!!deleteGuid} onHide={() => setDeleteGuid(null)} centered contentClassName={s.deleteModal}>
                <DiagonalLines />
                <div className={s.deleteHeader}>
                    <h5>Are you sure??</h5>
                </div>
                <div className={s.deleteBody}>
                    <p>This action cannot be undone.</p>
                </div>
                <div className={s.deleteFooter}>
                    <Button variant="secondary" onClick={() => setDeleteGuid(null)}>Cancel</Button>
                    <Button variant="danger" onClick={() => {
                        if (deleteGuid) {
                            setDeletingGuid(deleteGuid);
                            handleDeleteGroup(
                                deleteGuid,
                                undefined,
                                () => setDeletingGuid(null)
                            );
                        }
                        setDeleteGuid(null);
                    }}>Delete</Button>
                </div>
            </Modal>

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
}
export default ChatBoxes;