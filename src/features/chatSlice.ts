import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export type Message = {
    id: string;
    text: string;
    username: string;
    timestamp: number;
};

interface ChatState {
    messages: Message[];
}

const initialState: ChatState = {
    messages: [],
};

export const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        addMessage: (state, action: PayloadAction<{ text: string, username: string }>) => {
            const { text, username } = action.payload;
            
            const newMessage: Message = {
                id: Date.now().toString(), 
                text,
                username,
                timestamp: Date.now(),
            };
            
            
            state.messages.push(newMessage);
        },
    },
});

export const { addMessage } = chatSlice.actions;

export default chatSlice.reducer;