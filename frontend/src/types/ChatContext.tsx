import { Message } from "./Message";

export interface ChatContext {
    setOpen: (state: boolean) => void;
    messages: Message[];
    sendMessage: (content: string) => void;
    unread: number;
    open: boolean;
}