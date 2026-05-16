import { CometChat } from "@cometchat/chat-sdk-javascript";
import { useModal } from "./useModal";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export const useChatActionsForChatBoxes = () => {
    const navigate = useNavigate();
    const { hide, show, isVisible } = useModal();
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
    const [password, setPassword] = useState<string>('');
    const [groups, setGroups] = useState<CometChat.Group[]>([]);

    const [isJoining, setIsJoining] = useState(false);
    const [isDeletingGroup, setIsDeletingGroup] = useState(false);
    const [showingOwnerHisGroup, setshowingOwnerHisGroup] = useState<string | null>(null);

    const handleJoin = (guid: string, pass: string = "") => {
        const groupType = (pass ? CometChat.GROUP_TYPE.PASSWORD : CometChat.GROUP_TYPE.PUBLIC) as CometChat.GroupType;

        setIsJoining(true);

        CometChat.joinGroup(guid, groupType, pass).then(
            () => {
                hide();
                navigate(`/chat/${guid}`);
            },
            (error) => {
                console.log(error)
                if (error.code === "ERR_ALREADY_JOINED") {
                    hide()
                    navigate(`/chat/${guid}`);
                } else {
                    console.error("Failed some", error)
                }
            }
        )
    }

    const handleNewGroup = (newGroup: CometChat.Group) => {
        const guid = newGroup.getGuid();

        setshowingOwnerHisGroup(guid);

        setGroups(prev => [newGroup, ...prev].sort((a, b) => b.getCreatedAt() - a.getCreatedAt()));

        setTimeout(() => setshowingOwnerHisGroup(null), 3000)
    };

    const handleGroupSettingsUpdate = (updatedGroup: CometChat.Group) => {
        setGroups(prev =>
            prev.map(g => g.getGuid() === updatedGroup.getGuid() ? updatedGroup : g)
        );
    };


    const handleDeleteGroup = (GUID: string) => {
        setIsDeletingGroup(true);

        CometChat.deleteGroup(GUID)
            .then(() => {
                setGroups(prev => prev.filter(item => item.getGuid() !== GUID));
            })
            .catch((error: CometChat.CometChatException) => {
                console.error("Delete failed:", error);
            })
            .finally(() => {
                setIsDeletingGroup(false);
            });
    };


    const enterChat = (group: CometChat.Group) => {
        const guid = group.getGuid();
        const type = group.getType();
        const hasJoined = group.getHasJoined();

        console.log(`Пытаемся войти в группу id: ${guid}, тип: ${type} и уже в группе:${hasJoined}`);

        if (hasJoined) {
            console.log(` пользователь уже участник, переход в чат: ${guid}`);
            navigate(`/chat/${guid}`);
            return;
        }

        if (type === CometChat.GROUP_TYPE.PASSWORD) {
            console.log(`Есть пароль открытие модалки.`);
            setSelectedGroupId(guid);
            setPassword('');
            show();
        } else {
            console.log(`публичная/личная группа, запуск handleJoin.`);
            handleJoin(guid);
        }
    };

    return {
        groups, setGroups,
        selectedGroupId,
        password, setPassword,
        isVisible, hide, show,
        enterChat, handleDeleteGroup, handleJoin,
        handleNewGroup, handleGroupSettingsUpdate,
        isJoining, isDeletingGroup,
        showingOwnerHisGroup
    }

}

