import { Message } from "./Message";

export interface ChatContext {
    setOpen: (state: boolean) => void;
    messages: Message[];
    sendMessage: (content: string) => void;
    open: boolean;
}