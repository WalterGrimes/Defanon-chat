import { CometChat } from "@cometchat/chat-sdk-javascript";
import { FaLock, FaGlobe } from "react-icons/fa";
import styles from "./BoxStatus.module.css"; 

interface BoxStatusProps {
    type: string;
}

const BoxStatus = ({ type }: BoxStatusProps) => {
    const isPrivate = type === CometChat.GROUP_TYPE.PASSWORD;

    const statusClassName = `${styles.statusBadge} ${
        isPrivate ? styles.private : styles.public
    }`;

    return (
        <div className={statusClassName}>
            {isPrivate ? (
                <>
                    <FaLock size={10} />
                    <span>Private</span>
                </>
            ) : (
                <>
                    <FaGlobe size={10} />
                    <span>Public</span>
                </>
            )}
        </div>
    );
};

export default BoxStatus;