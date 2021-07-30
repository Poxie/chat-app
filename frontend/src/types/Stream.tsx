import { User } from "./User";

export interface Stream {
    stream: MediaStream | null;
    user: User;
    isMuted: boolean;
    hasCamera: boolean;
    disconnected: boolean;
    connecting: boolean;
    isPinned: boolean;
    selfMuted: boolean;
    isPresentation?: boolean;
}