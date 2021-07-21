import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from 'socket.io-client';
import Peer from 'peerjs';
import { User } from "../types/User";
import { Stream } from "../types/Stream";
import { useFeedback } from "./FeedbackProvider";

const socket: any = io('http://localhost:3001');

interface ContextType {
    roomId: string | undefined;
    selfStream: MediaStream | null;
    streams: Stream[];
    toggleMute: () => void;
    toggleCamera: () => void;
    isMuted: boolean;
    hasCamera: boolean;
    socket: any;
    removeStream: (userId: string) => void;
    setConnected: (userId: string) => void;
    joinRoom: () => void;
    leaveRoom: () => void;
    isConnected: boolean;
}
// @ts-ignore
const RoomContext = createContext<ContextType>(null);

export const useRoom = () => {
    return useContext(RoomContext);
}

interface Params {
    roomId: string | undefined
}
interface Props {
    children: any;
}
export const RoomProvider: React.FC<Props> = ({ children }) => {
    const { roomId } = useParams<Params>();
    const [selfStream, setSelfStream] = useState<MediaStream | null>(null);
    const selfUser = useRef<any>(null);
    const [streams, setStreams] = useState<Stream[]>([]);
    const [isMuted, setIsMuted] = useState(false);
    const [hasCamera, setHasCamera] = useState(true);
    const isMutedRef = useRef(false);
    const hasCameraRef = useRef(true);
    const [forceUpdate, setForceUpdate] = useState(0);
    const [isConnected, setIsConnected] = useState(false);
    const { setFeedback } = useFeedback();

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        }).then(stream => {
            setSelfStream(stream)
        });
    }, []);
    const leaveRoom = useMemo(() => () => {
        setIsConnected(false);
        setStreams([]);
        socket.emit('leave-room', {roomId, user: {username: 'Poxen', id: selfUser.current.id}});
    }, [setIsConnected, roomId]);
    const joinRoom = useMemo(() => () => {
        setIsConnected(true);
        initiateRoomConnection();
    }, [setIsConnected]);
    const initiateRoomConnection = () => {
        const peer = new Peer(undefined, {
            host: '/',
            port: 3002
        })
        peer.on('open', id => {
            console.log(id);
            socket.emit('join-room', {roomId, isMuted: isMutedRef.current, hasCamera: hasCameraRef.current, user: {username: 'Poxen', id}})
            selfUser.current = {username: 'Poxen', id};
        })
        peer.on('error', console.error);
        // Saving all calls for when we close 
        const calls: any = {};

        // Asking user for webcam and mic
        navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        }).then(stream => {
            setSelfStream(stream)

            // Answer calls if received
            let streamList: any = {};
            peer.on('call', call => {
                if(isMutedRef.current) stream.getAudioTracks()[0].enabled = false;
                if(!hasCameraRef.current) stream.getVideoTracks()[0].enabled = false;
                call.answer(stream);
                const user: User = call.metadata.user;

                call.on('stream', userVideoStream => {
                    if(streamList[call.peer]) return;
                    streamList[call.peer] = call;

                    setStreams(previous => [...previous, ...[{stream: userVideoStream, user, isMuted, hasCamera, disconnected: false, connecting: false}]]);
                })
            })

            // Handling users muting themselves
            socket.on('toggle-mute', ({ isMuted, streamId }: any) => {
                setStreams(previous => {
                    previous.forEach(stream => {
                        if(stream.stream.id == streamId) {
                            stream.isMuted = isMuted;
                        }
                    })
                    return previous;
                })
                setForceUpdate(previous => previous + 1);
            })
            // Handling users enabling camera
            socket.on('toggle-camera', ({ hasCamera, streamId }: any) => {
                setStreams(previous => {
                    previous.forEach(stream => {
                        if(stream.stream.id == streamId) {
                            stream.hasCamera = hasCamera;
                        }
                    })
                    return previous;
                })
                setForceUpdate(previous => previous + 1);
            })

            // Handling users joining
            let callList: any = {};
            socket.on('user-connected', ({ user, isMuted, hasCamera }: any) => {
                console.log(`User connected: ${user.id}`)
                setFeedback(`${user.username} connected`)

                setTimeout(() => {
                    const call = peer.call(user.id, stream, {
                        metadata: {
                            user: selfUser.current,
                            isMuted: isMutedRef.current,
                            hasCamera: hasCameraRef.current
                        }
                    });
                    let userStream: null | MediaStream = null;
                    call.on('stream', userVideoStream => {
                        if(callList[call.peer]) return;
                        userStream = userVideoStream;
                        setStreams(previous => [...previous, ...[{stream: userVideoStream, user, isMuted, hasCamera, disconnected: false, connecting: true}]]);
                        callList[call.peer] = call;
                    })
                    call.on('close', () => {
                        setStreams(previous => previous.filter(s => s.stream !== userStream));
                    })
                    call.on('error', error => {
                        console.log(error);
                    })
                    
                    calls[user.id] = call;
                }, 1000);
            })
            // Handling users leaving
            socket.on('user-disconnected', (user: User) => {
                console.log('User disconnected');
                animateUserDisconnection(user.id);
                setFeedback(`${user.username} disconnected`)
            })
        }).catch(console.error);
    };
    useEffect(() => {
        if(isConnected) return;
        socket.off('user-disconnected');
        socket.off('user-connected');
        socket.off('toggle-mute');
        socket.off('toggle-camera');
    }, [isConnected])

    const animateUserDisconnection = useMemo(() => (userId: string) => {
        setStreams(previous => {
            previous.forEach(stream => {
                console.log(stream.user.id, userId);
                if(stream.user.id == userId) {
                    stream.disconnected = true;
                }
            })
            return previous;
        })
    }, [setStreams]);

    const toggleMute = useMemo(() => () => {
        console.log('test')
        if(!selfStream) return;
        const track = selfStream.getAudioTracks()[0];
        track.enabled = !track.enabled;
        socket.emit('toggle-mute', ({ roomId, isMuted: !track.enabled, streamId: selfStream.id }))
        setIsMuted(!track.enabled);
        isMutedRef.current = !track.enabled;
    }, [selfStream, roomId]);
    const toggleCamera = useMemo(() => () => {
        if(!selfStream) return;
        const track = selfStream.getVideoTracks()[0];
        track.enabled = !track.enabled;
        socket.emit('toggle-camera', ({ roomId, hasCamera: track.enabled, streamId: selfStream.id }))
        setHasCamera(track.enabled);
        hasCameraRef.current = track.enabled;
    }, [selfStream, roomId]);
    
    // Remove stream after disconnect animation
    const removeStream = (userId: string) => {
        setStreams(previous => previous.filter(stream => stream.user.id !== userId));
    };
    // Remove connecting status
    const setConnected = (userId: string) => {
        setStreams(previous => previous.map(stream => {
            if(stream.user.id === userId) {
                stream.connecting = false;
            }
            return stream;
        }))
    }


    const value = {
        roomId,
        selfStream,
        streams,
        toggleMute,
        toggleCamera,
        removeStream,
        isMuted,
        hasCamera,
        socket,
        setConnected,
        joinRoom,
        leaveRoom,
        isConnected
    }
    
    return(
        <RoomContext.Provider value={value}>
            {children}
        </RoomContext.Provider>
    )
}