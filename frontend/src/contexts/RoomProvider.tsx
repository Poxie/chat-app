import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from 'socket.io-client';
import Peer from 'peerjs';
import { User } from "../types/User";
import { Stream } from "../types/Stream";
import { useFeedback } from "./FeedbackProvider";
import { Params } from "../types/Params";
import { useAuthentication } from "./AuthenticationProvider";
import { useDevice } from "./DeviceProvider";

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
    setPinned: (userId: string | null) => void;
    setSelfMute: (userId: string, state: boolean) => void;
    present: (state: MediaStream | null) => void;
    presentation: MediaStream | null;
}
// @ts-ignore
const RoomContext = createContext<ContextType>(null);

export const useRoom = () => {
    return useContext(RoomContext);
}

interface Props {
    children: any;
}
export const RoomProvider: React.FC<Props> = ({ children }) => {
    const { roomId } = useParams<Params>();
    const { user } = useAuthentication();
    const [selfStream, setSelfStream] = useState<MediaStream | null>(null);
    const [presentation, setPresentation] = useState<MediaStream | null>(null);
    const presentationPeer = useRef<any>(null);
    const selfUser = useRef<any>(null);
    const [streams, setStreams] = useState<Stream[]>([]);
    const [isMuted, setIsMuted] = useState(false);
    const [hasCamera, setHasCamera] = useState(true);
    const isMutedRef = useRef(false);
    const hasCameraRef = useRef(true);
    const [forceUpdate, setForceUpdate] = useState(0);
    const [isConnected, setIsConnected] = useState(false);
    const { setFeedback } = useFeedback();
    const { devices } = useDevice();
    const devicesRef = useRef(devices);
    const changeDevice = useRef<null | (() => void)>(null);

    useEffect(() => {
        devicesRef.current = devices;
        if(!changeDevice.current) return;
        changeDevice.current();
    }, [devices]);

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({
            video: {
                deviceId: devices['video']
            },
            audio: {
                deviceId: devices['audio']
            }
        }).then(stream => {
            setSelfStream(stream)
        });
    }, []);
    const leaveRoom = useMemo(() => () => {
        setIsConnected(false);
        setStreams([]);
        const { id, username } = selfUser.current;
        socket.emit('leave-room', {roomId, user: {username, id}});
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
            selfUser.current = {username: user?.username, id};
            socket.emit('join-room', {roomId, isMuted: isMutedRef.current, hasCamera: hasCameraRef.current, user: {username: selfUser.current.username, id}})
        })
        peer.on('error', console.error);

        // Saving all calls for when we close 
        const calls: any = {};

        // Asking user for webcam and mic
        navigator.mediaDevices.getUserMedia({
            video: {
                deviceId: devices['video']
            },
            audio: {
                deviceId: devices['audio']
            }
        }).then(stream => {
            setSelfStream(stream)
            
            // Answer calls if received
            let streamList: any = {};
            peer.on('call', call => {
                if(isMutedRef.current) stream.getAudioTracks()[0].enabled = false;
                if(!hasCameraRef.current) stream.getVideoTracks()[0].enabled = false;
                call.answer(stream);
                const user: User = call.metadata.user;
                const { isMuted, hasCamera } = call.metadata;

                call.on('stream', userVideoStream => {
                    if(streamList[call.peer]) return;
                    streamList[call.peer] = call;

                    setStreams(previous => [...previous, ...[{stream: userVideoStream, user, isMuted, hasCamera, disconnected: false, connecting: false, isPinned: false, selfMuted: false}]]);
                })
            })

            // Handling users muting themselves
            socket.on('toggle-mute', ({ isMuted, streamId, userId }: any) => {
                setStreams(previous => {
                    previous.forEach(stream => {
                        if(stream.stream.id == streamId) {
                            stream.isMuted = isMuted;
                        }
                        if(stream.user.id === userId) {
                            stream.isMuted = isMuted;
                        }
                    })
                    return previous;
                })
                setForceUpdate(previous => previous + 1);
            })
            // Handling users enabling camera
            socket.on('toggle-camera', ({ hasCamera, streamId, userId }: any) => {
                setStreams(previous => {
                    previous.forEach(stream => {
                        if(stream.stream.addEventListener == streamId) {
                            stream.hasCamera = hasCamera;
                        }
                        if(stream.user.id === userId) {
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
                        setStreams(previous => [...previous, ...[{stream: userVideoStream, user, isMuted, hasCamera, disconnected: false, connecting: true, isPinned: false, selfMuted: false}]]);
                        callList[call.peer] = call;
                    })
                    call.on('close', () => {
                        setStreams(previous => previous.filter(s => s.stream !== userStream));
                    })
                    call.on('error', error => {
                        console.log(error);
                    })
                    
                    calls[user.id] = call;
                    
                    // Making it possible to change device during meeting
                    const deviceChange = () => {
                        const { video, audio } = devicesRef.current;
                        navigator.mediaDevices.getUserMedia({
                            video: {
                                deviceId: video
                            },
                            audio: {
                                deviceId: audio
                            }
                        }).then(stream => {
                            if(isMutedRef.current) stream.getAudioTracks()[0].enabled = false;
                            if(!hasCameraRef.current) stream.getVideoTracks()[0].enabled = false;
                            call.peerConnection.getSenders()[0].replaceTrack(stream.getTracks()[0]);
                            setSelfStream(stream);
                        })
                    }
                    changeDevice.current = deviceChange;
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
        socket.emit('toggle-mute', ({ roomId, isMuted: !track.enabled, streamId: selfStream.id, userId: selfUser.current?.id }))
        setIsMuted(!track.enabled);
        isMutedRef.current = !track.enabled;
    }, [selfStream, roomId]);
    const toggleCamera = useMemo(() => () => {
        if(!selfStream) return;
        const track = selfStream.getVideoTracks()[0];
        track.enabled = !track.enabled;
        socket.emit('toggle-camera', ({ roomId, hasCamera: track.enabled, streamId: selfStream.id, userId: selfUser.current?.id }))
        setHasCamera(track.enabled);
        hasCameraRef.current = track.enabled;
    }, [selfStream, roomId]);
    const setSelfMute = useMemo(() => (userId: string, state: boolean) => {
        setStreams(previous => previous.map(stream => {
            if(stream.user.id === userId) {
                stream.selfMuted = state;
            }
            return stream;
        }))
    }, []);
    
    // Remove stream after disconnect animation
    const removeStream = useMemo(() => (userId: string) => {
        setStreams(previous => previous.filter(stream => stream.user.id !== userId));
    }, []);
    // Remove connecting status
    const setConnected = useMemo(() => (userId: string) => {
        setStreams(previous => previous.map(stream => {
            if(stream.user.id === userId) {
                stream.connecting = false;
            }
            return stream;
        }))
    }, []);

    // Pinning streams
    const setPinned = useMemo(() => (userId: string | null) => {
        setStreams(previous => previous.map(stream => {
            stream.isPinned = stream.user.id === userId;
            return stream;
        }))
    }, []);

    const present = useMemo(() => (state: MediaStream | null) => {
        if(!state) {
            // Ignoring as its just not defined in typescript notation
            // @ts-ignore
            navigator.mediaDevices.getDisplayMedia({video: true, audio: true})
                .then((stream: MediaStream) => {
                    const peer = new Peer(undefined, {
                        host: '/',
                        port: 3002
                    })
                    let shareSocket: any;
                    let streamUser: any;
                    peer.on('open', id => {
                        shareSocket = io('http://localhost:3001');
                        streamUser = {...selfUser.current, ...{id}};
                        shareSocket.emit('join-room', ({ user: streamUser, roomId, isMuted: false, hasCamera: true }));
                        presentationPeer.current = peer;
                        setPresentation(stream);
                    })
                    peer.on('disconnected', () => {
                        console.log('closing');
                        shareSocket.emit('leave-room', ({ roomId, user: streamUser }));
                    })
                    peer.on('call', call => {
                        call.answer(stream);
                    })
                })
        } else {
            if(!presentationPeer.current) return;
            presentationPeer.current.disconnect();
            setPresentation(previous => {
                previous?.getTracks().forEach(track => track.stop());
                return null;
            });
        }
    }, []);


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
        isConnected,
        setPinned,
        setSelfMute,
        present,
        presentation
    }
    
    return(
        <RoomContext.Provider value={value}>
            {children}
        </RoomContext.Provider>
    )
}