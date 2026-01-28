import { CometChat } from "@cometchat/chat-sdk-javascript";
import { useState } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import PasswordField from "../PasswordField";
import BoxStatus from "./BoxStatus";
import { useModal } from "../../hooks/useModal";

interface CreateBoxProps {
    onGroupCreate: (newGroup: CometChat.Group) => void;
}

const CreateBox = ({ onGroupCreate }: CreateBoxProps) => {
    const [boxName, setBoxName] = useState("");
    const [password, setPassword] = useState<string>('');
    const {isVisible , show, hide} = useModal();

    const handleClose = () => {
        setBoxName("");
        setPassword("");
        hide();
    };

    const handleCreateGroup = () => {
        const GUID = `group_${Date.now()}`;
        const trimmedPassword = password.trim();

        const boxType = trimmedPassword !== ""
            ? CometChat.GROUP_TYPE.PASSWORD
            : CometChat.GROUP_TYPE.PUBLIC;

        const group = new CometChat.Group(GUID, boxName, boxType, trimmedPassword);

        CometChat.createGroup(group).then(
            (createdGroup) => {
                console.log("Group created successfully:", createdGroup);
                onGroupCreate(createdGroup);
                handleClose();
            },
            (error) => {
                console.error("Group creation failed:", error);
            }
        );
    };

    return (
        <div>
            <Button variant="success" onClick={show}>
                Create Box
            </Button>

            <Modal show={isVisible} onHide={hide} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Create New Box</Modal.Title>
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
                        onClick={handleCreateGroup}
                        disabled={!boxName.trim()}
                    >
                        Create
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default CreateBox;