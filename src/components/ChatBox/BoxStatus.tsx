import { Badge } from "react-bootstrap";
import { CometChat } from "@cometchat-pro/chat";
import { FaLock, FaGlobe } from "react-icons/fa"; 

interface BoxStatusProps {
    type: string;
}

const BoxStatus = ({ type }: BoxStatusProps) => {
    const isPasswordHas = type === CometChat.GROUP_TYPE.PASSWORD;

    return (
        <Badge bg={isPasswordHas ? "danger" : "info"}
            className="d-flex align-items-center gap-2 p-2"
            style={{ width: 'fit-content' }}
        >
            {isPasswordHas ? (
                <>
                    <FaLock size={12} />
                    <span>PRIVATE</span>
                </>
            ) : (
                <>
                    <FaGlobe size={12} />
                    <span>PUBLIC</span>
                </>
            )}
        </Badge>
    )
}

export default BoxStatus;