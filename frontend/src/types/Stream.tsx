import { User } from "./User";

export interface Stream {
    stream: MediaStream;
    user: User;
    isMuted: boolean;
    hasCamera: boolean;
    disconnected: boolean;
    connecting: boolean;
}