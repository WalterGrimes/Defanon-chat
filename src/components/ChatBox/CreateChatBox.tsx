import { CometChat } from "@cometchat/chat-sdk-javascript";
import { useState } from "react";


const CreateBox = () => {
    const [boxName, setBoxName] = useState("");

    const handleCreateGroup = () => {
        const GUID = `group_${Date.now()}`;
        const boxType = CometChat.GROUP_TYPE.PUBLIC;
        const password = "";

        const group = new CometChat.Group(GUID, boxName, boxType, password);

        CometChat.createGroup(group).then(
            group => console.log("Group created:", group),
            error => console.log("Error:", error)
        )
    }

    return (
        <div>
            <input
            type="text"
            placeholder="Название группы"
            value={boxName}
            onChange={(e) => setBoxName(e.target.value)}
            />
            <button onClick={handleCreateGroup}>Create Group</button>
        </div>
    )

}

export default CreateBox;