import type { CometChat } from "@cometchat-pro/chat";


interface BaseState {
    name?: string;
    isLoading?: boolean
    redirect: boolean;
}

export interface SignupState extends BaseState {
    uid: string;
    email: string;
    UIDError: string | null;
    errors: Record<string, string[]> | null;
}

export interface HomeState extends BaseState {
    user: any;
    error: string | null;
}

export interface ChatState extends BaseState {
    user: any;
    receiverID: string;
    messageText: string;
    messages: any[];
    authToken: string | null;
    messageType: typeof CometChat.MESSAGE_TYPE.TEXT,
    groupType: string;
    receiverType: typeof CometChat.RECEIVER_TYPE.GROUP,
}