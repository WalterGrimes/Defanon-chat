import { CometChat } from "@cometchat/chat-sdk-javascript";
import React, { useState } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import PasswordField from "../../Login/PasswordField";
import BoxStatus from "../BoxStatus/BoxStatus";
import { useModal } from "../../../hooks/useModal";
import { CreatingGroupLoader } from "../../../utilits/Preloader/Loaders";
import styles from "./CreateBox.module.css";
import { useAuth } from "../../../context/ChatContext";

interface CreateBoxProps {
    onGroupCreate: (newGroup: CometChat.Group) => void;
}


const CreateBox = ({ onGroupCreate }: CreateBoxProps) => {
    const { user } = useAuth();
    const [boxName, setBoxName] = useState("");
    const [password, setPassword] = useState<string>('');
    const [description, setDescription] = useState("");
    const { isVisible, show, hide } = useModal();
    const [isCreatingGroup, setIsCreatingGroup] = useState(false);

    const defaultDesc = `Welcome to chat dear - ${user?.getName() || 'user'}`;


    const handleClose = () => {
        setBoxName("");
        setPassword("");
        setDescription("");
        setIsCreatingGroup(false);
        hide();
    };

    const handleCreateGroup = (e: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!boxName.trim()) return;

        setIsCreatingGroup(true);

        const GUID = `group_${Date.now()}`;
        const trimmedPassword = password.trim();

        const boxType = trimmedPassword !== ""
            ? CometChat.GROUP_TYPE.PASSWORD
            : CometChat.GROUP_TYPE.PUBLIC;

        const group = new CometChat.Group(GUID, boxName, boxType, trimmedPassword);
        group.setMetadata({ description: description.trim() || defaultDesc });

        CometChat.createGroup(group).then(
            (createdGroup) => {
                onGroupCreate(createdGroup);
                handleClose();
            },
            (error) => {
                console.error("Group creation failed:", error);
                setIsCreatingGroup(false);
            }
        );
    };

    if (isCreatingGroup) {
        return <CreatingGroupLoader message="Создание вашей коробки..." />;
    }

    return (
        <div>
            <button
                onClick={show}
                title="Create Box"
                className={styles.addButton}
            >
                <span className={styles.iconHorizontal} />
                <span className={styles.iconVertical} />
            </button>

            <Modal show={isVisible} onHide={hide} centered>
                <Form onSubmit={handleCreateGroup}>
                    <button type="submit" style={{ display: 'none' }}></button>
                    <Modal.Header>
                        <Modal.Title>Create New Box</Modal.Title>
                        <button className={styles.closeBtn} onClick={handleClose} type="button" title="Закрыть">
                            <span className={styles.closeIconA} />
                            <span className={styles.closeIconB} />
                        </button>
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
                                maxLength={15}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Description <small className="text-muted">(optional)</small></Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                placeholder={defaultDesc}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                maxLength={150}
                            />
                            <Form.Text className="text-muted">
                                {description.length}/150
                            </Form.Text>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Password<small className="text-muted">(optional)</small></Form.Label>
                            <PasswordField value={password} onChange={(e) => setPassword(e.target.value)} />
                        </Form.Group>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleClose} type="button">
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" disabled={!boxName.trim()}>
                            Create
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default CreateBox;