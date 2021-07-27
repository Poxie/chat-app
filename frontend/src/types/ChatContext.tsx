import { Message } from "./Message";

export interface ChatContext {
    messages: Message[];
    sendMessage: (content: string) => void;
    unread: number;
}