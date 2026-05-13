import { Modal, Button } from 'react-bootstrap';
import s from './GroupInfoModal.module.css';
import { getUserColor } from '../../utilits/ColorHelper';
import { useEffect, useState } from 'react';
import { CometChat } from "@cometchat/chat-sdk-javascript";

interface GroupInfoModalProps {
    show: boolean;
    onHide: () => void;
    group: CometChat.Group | null;
}

const DEFAULT_DESCRIPTION = "Welcome to chat dear - Gold";

export const GroupInfoModal = ({ show, onHide, group }: GroupInfoModalProps) => {
    const [ownerName, setOwnerName] = useState<string>('Загрузка...');

    useEffect(() => {
        if (show && group) {
            const ownerUid = group.getOwner();

            CometChat.getUser(ownerUid).then(
                user => {
                    setOwnerName(user.getName());
                },
                error => {
                    console.log('Ошибка', error);
                    setOwnerName('AnOnYm:)')
                }
            );
        }
    }, [show, group]);

    if (!group) return null;

    const ownerUid = group.getOwner();
    const description = (group.getMetadata() as any)?.description || DEFAULT_DESCRIPTION;

    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            contentClassName={s.modalContent}
            dialogClassName={s.modalPop}
        >
            <Modal.Header className={s.header}>  {/* убери closeButton */}
                <Modal.Title>Информация о коробке</Modal.Title>
                <button className={s.closeBtn} onClick={onHide} type="button" title="Закрыть">
                    <span className={s.closeIconA} />
                    <span className={s.closeIconB} />
                </button>
            </Modal.Header>
            <Modal.Body>
                <div className="d-flex flex-column gap-3">
                    <InfoItem label="Название" value={group.getName()} />

                    <InfoItem
                        label="Описание"
                        value={description}
                        isDescription
                    />

                    <InfoItem
                        label="GUID (UID)"
                        value={group.getGuid()}
                        isCode
                    />

                    <InfoItem
                        label="Создатель"
                        value={ownerName}
                        customColor={getUserColor(ownerUid)}
                    />

                    <InfoItem
                        label="Дата создания"
                        value={new Date(group.getCreatedAt() * 1000).toLocaleDateString()}
                    />
                </div>
            </Modal.Body>
            <Modal.Footer className={s.footer}>
                <Button variant="outline-info" onClick={onHide}>Закрыть</Button>
            </Modal.Footer>
        </Modal>
    );
};

const InfoItem = ({ label, value, isCode, isDescription, customColor }:
    { label: string, value: string | undefined, isCode?: boolean, isDescription?: boolean, customColor?: string }) => (
    <div>
        <div className={s.label}>{label}</div>
        {isCode ? (
            <div className={s.uidCode}>{value}</div>
        ) : isDescription ? (
            <div className={s.description}>{value || DEFAULT_DESCRIPTION}</div>
        ) : (
            <div className={s.value}
                style={customColor ? { color: customColor, fontWeight: 'bold' } : {}}
            >{value || '—'}</div>
        )}
    </div>
);

