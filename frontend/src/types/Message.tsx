import { User } from "./User";

export interface Message {
    content: string;
    author: User;
    date: number;
}