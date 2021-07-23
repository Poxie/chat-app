import { Message } from "./Message";

export interface ChatNotification extends Message {
    animateIn: boolean;
    animateOut: boolean;
}