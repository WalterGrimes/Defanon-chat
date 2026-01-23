import { CometChat } from "@cometchat/chat-sdk-javascript";
import { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import PasswordField from "../PasswordField";

interface CreateBoxProps {
    onGroupCreate: (newGroup: CometChat.Group) => void;
}

const CreateBox = ({ onGroupCreate }: CreateBoxProps) => {
    const [boxName, setBoxName] = useState("");
    const [showWindow, setShowWindow] = useState(false);
    const [password, setPassword] = useState<string>('');


    const handleClose = () => setShowWindow(false);
    const handleShow = () => setShowWindow(true);

    const handleCreateGroup = () => {
        const GUID = `group_${Date.now()}`;
        const boxType = CometChat.GROUP_TYPE.PUBLIC;
        const password = "";

        const group = new CometChat.Group(GUID, boxName, boxType, password);

        CometChat.createGroup(group).then(
            () => {
                console.log("Group created:", group),
                    onGroupCreate(group)
                handleClose();
                setBoxName("")
            },
            (error) => {
                console.log("Ошибка", error)
            }
        )
    }


    return (
        <div>
            <Button variant="success" onClick={handleShow}>
                CreateGroup
            </Button>

            <Modal show={showWindow} onHide={handleClose} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Настройка коробки</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <PasswordField value={password} onChange={(e) => setPassword(e.target.value)} />
                    <p>Здесь скоро будет настройки коробки</p>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Отмена
                    </Button>
                    <input
                        type="text"
                        placeholder="Название группы"
                        value={boxName}
                        onChange={(e) => setBoxName(e.target.value)}
                    />
                    <button onClick={handleCreateGroup} disabled={!boxName.trim}>Create Group</button>
                    <Button onClick={() => {
                        handleClose();
                    }}>
                    </Button>
                </Modal.Footer>
            </Modal>


        </div>
    )

}


export default CreateBox;