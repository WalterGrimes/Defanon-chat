import { CometChat } from "@cometchat/chat-sdk-javascript";
import { useState } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import PasswordField from "../../Login/PasswordField";
import BoxStatus from "../BoxStatus/BoxStatus";
import { useModal } from "../../../hooks/useModal";
import s from './EditBox.module.css';
import { useAuth } from "../../../context/ChatContext";

interface EditBoxProps {
    group: CometChat.Group;
    onGroupUpdate: (newGroup: CometChat.Group) => void;
}

const EditBox = ({ group, onGroupUpdate }: EditBoxProps) => {
    const { user } = useAuth();
    const [boxName, setBoxName] = useState(group.getName());
    const [password, setPassword] = useState<string>('');
    const existingDescription = (group.getMetadata() as any)?.description || "";
    const [description, setDescription] = useState(existingDescription);
    const { isVisible, show, hide } = useModal();
    const [isUpdating, setIsUpdating] = useState(false);

    const defaultDesc = `Welcome to chat dear - ${user?.getName() || 'user'}`;

    const handleClose = () => {
        setBoxName(group.getName());
        setPassword("");
        setDescription(existingDescription);
        hide();
    };

    const handleUpdateGroup = () => {
        setIsUpdating(true);
        hide();

        const GUID = group.getGuid();
        const trimmedPassword = password.trim();

        const boxType = trimmedPassword !== ""
            ? CometChat.GROUP_TYPE.PASSWORD
            : CometChat.GROUP_TYPE.PUBLIC;

        const updatedGroup = new CometChat.Group(GUID, boxName, boxType, trimmedPassword);
        updatedGroup.setMetadata({ description: description.trim() || defaultDesc });

        CometChat.updateGroup(updatedGroup).then(
            (res) => {
                onGroupUpdate(res);
                setIsUpdating(false);
            },
            (error) => {
                console.error("Update failed:", error);
                setIsUpdating(false);
            }
        );
    };

    return (
        <div>
            {isUpdating && (
                <div className={s.cardOverlay}>
                    <div className="spinner-border text-success" role="status" style={{ width: '2rem', height: '2rem' }} />
                    <small className={s.cardOverlayText}>Saving...</small>
                </div>
            )}

            <button className="settings-icon-btn" onClick={show} title="Настройки коробки">
                ⚙
            </button>

            <Modal show={isVisible} onHide={hide} centered>
                <Form onSubmit={(e) => {
                    e.preventDefault();
                    if (boxName.trim()) handleUpdateGroup();
                }}>
                    <Modal.Header>
                        <Modal.Title>Current box settings</Modal.Title>
                        <button className={s.closeBtn} onClick={handleClose} type="button" title="Закрыть">
                            <span className={s.closeIconA} />
                            <span className={s.closeIconB} />
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
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        if (boxName.trim()) handleUpdateGroup();
                                    }
                                }}
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
                        <Button
                            variant="primary"
                            type="submit"
                            disabled={!boxName.trim()}
                        >
                            Save changes
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default EditBox;