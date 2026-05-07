import { CometChat } from "@cometchat/chat-sdk-javascript";
import { useState } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import PasswordField from "../PasswordField";
import BoxStatus from "./BoxStatus";
import { useModal } from "../../hooks/useModal";
import { CreatingGroupLoader } from "../../features/Loaders";

interface EditBoxProps {
    group: CometChat.Group;
    onGroupUpdate: (newGroup: CometChat.Group) => void;
}

const EditBox = ({ group, onGroupUpdate }: EditBoxProps) => {
    const [boxName, setBoxName] = useState(group.getName());
    const [password, setPassword] = useState<string>('');
    const { isVisible, show, hide } = useModal();
    const [isUpdating, setIsUpdating] = useState(false);

    const handleClose = () => {
        setBoxName("");
        setPassword("");
        hide();
    };

    const handleUpdateGroup = () => {
        setIsUpdating(true);

        const GUID = group.getGuid();
        const trimmedPassword = password.trim();

        const boxType = trimmedPassword !== ""
            ? CometChat.GROUP_TYPE.PASSWORD
            : CometChat.GROUP_TYPE.PUBLIC;

        const updatedGroup = new CometChat.Group(GUID, boxName, boxType, trimmedPassword);

        CometChat.updateGroup(updatedGroup).then(
            (res) => {
                onGroupUpdate(res);
                hide();
                setIsUpdating(false);
            },
            (error) => {
                console.error("Update failed:", error);
                setIsUpdating(false);
            }
        );
    };

    if (isUpdating) return <CreatingGroupLoader message="Сохраняем изменения..." />;


    return (
        <div>
            <button className="settings-icon-btn" onClick={show} title="Настройки коробки">
                ⚙
            </button>

            <Modal show={isVisible} onHide={hide} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Current box settings</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <div className="mb-3">
                        <BoxStatus type={password.trim() ? CometChat.GROUP_TYPE.PASSWORD : CometChat.GROUP_TYPE.PUBLIC} />
                    </div>
                    <Form.Group className="mb-3">
                        <Form.Label>Box Name</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter a name for your box"
                            value={boxName}
                            onChange={(e) => setBoxName(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Password</Form.Label>
                        <PasswordField value={password} onChange={(e) => setPassword(e.target.value)} />
                    </Form.Group>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleUpdateGroup}
                        disabled={!boxName.trim()}
                    >
                        Save changes
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default EditBox;