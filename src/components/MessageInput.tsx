import React, { useState } from "react";

type MessageInputProps = {
    onSendMessage: (text: string) => void;
}

export const MessageInput = ({ onSendMessage }: MessageInputProps) => {
    const [inputText, setInputText] = useState("")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!inputText.trim()) return;

        onSendMessage(inputText);

        setInputText("")
    }

    return (
        <form onSubmit={handleSubmit}>
            <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Введите сообщение"
            />
            <button type="submit" disabled={!inputText.trim()}>
                Отправить
            </button>
        </form>
    )

}