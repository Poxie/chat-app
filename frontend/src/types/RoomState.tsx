import { Stream } from "./Stream";
import { User } from "./User";

export interface RoomState {
    selfStream: null | MediaStream;
    presentation: any,
    streams: Stream[];
    isMuted: boolean;
    hasCamera: boolean;
    isConnected: boolean;
    isRecording: null | {
        stream: MediaStream;
        recorder: any;
    };
    isCurrentlyRecording: false | User;
    [x: string]: any;
}