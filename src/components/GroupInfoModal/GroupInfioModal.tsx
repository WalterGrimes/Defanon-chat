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

export const GroupInfoModal = ({ show, onHide, group }: GroupInfoModalProps) => {
    const [ownerName,setOwnerName] = useState<string>('Загрузка...');

    useEffect(() => {
        if(show && group){
            const ownerUid = group.getOwner();

            CometChat.getUser(ownerUid).then(
                user => {
                    setOwnerName(user.getName());
                },
                error => {
                    console.log('Ошибка',error);
                    setOwnerName('AnOnYm:)')
                }
            )
        }
    }, [show,group]);

    if (!group) return null;

    const ownerUid = group.getOwner();

    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            contentClassName={s.modalContent}
            dialogClassName={s.modalPop}
        >
            <Modal.Header closeButton className={s.header}>
                <Modal.Title>Информация о коробке</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="d-flex flex-column gap-3">
                    <InfoItem label="Название" value={group.getName()} />

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

const InfoItem = ({ label, value, isCode, customColor }: 
    { label: string, value: string | undefined, isCode?: boolean, customColor?: string }) => (
    <div>
        <div className={s.label}>{label}</div>
        {isCode ? (
            <div className={s.uidCode}>{value}</div>
        ) : (
            <div className={s.value}
                style={customColor ? { color: customColor, fontWeight: 'bold' } : {}}
            >{value || '—'}</div>
        )}
    </div>
);