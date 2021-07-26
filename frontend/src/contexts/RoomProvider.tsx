import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { io, Socket } from 'socket.io-client';
import Peer from 'peerjs';
import { User } from "../types/User";
import { Stream } from "../types/Stream";
import { useFeedback } from "./FeedbackProvider";
import { Params } from "../types/Params";
import { useAuthentication } from "./AuthenticationProvider";
import { useDevice } from "./DeviceProvider";
import { DefaultEventsMap } from "socket.io-client/build/typed-events";
import { ContextUser } from "../types/AuthenticationContext";
import { RequestMediaType } from "../types/RequestMediaType";

const socket = io('http://localhost:3001');

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

const generateId = () => {
    let id = '';
    const opts = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for(let i = 0; i < 50; i++) {
        id += opts[Math.floor(Math.random() * (opts.length - 1))];
    }
    return id;
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

    const requestUserMedia: RequestMediaType['RequestUserMedia'] = useMemo(() => (type='getUserMedia', videoDeviceId, audioDeviceId) => {
        // Ignoring since getDisplayMedia isn't defined in typescript notation
        // @ts-ignore
        return navigator.mediaDevices[type]({
            video: {
                deviceId: videoDeviceId || devices['video']
            },
            audio: {
                deviceId: audioDeviceId || devices['audio']
            }
        })
    }, []);

    const createMemberConnection = async (socket: Socket<DefaultEventsMap>, user: ContextUser, isMuted=false, hasCamera=true, type: 'getUserMedia' | 'getDisplayMedia'='getUserMedia', isPresentation=false) => {
        return requestUserMedia(type)
            .then(stream => {
                const id = generateId();
                const peer = new Peer(id, {
                    host: '/',
                    port: 3002
                })
                let newUser = {...user, ...{id}};
                peer.on('open', id => {
                    socket.emit('join-room', {roomId, isMuted, hasCamera, user: newUser, isPresentation});
                })
                peer.on('disconnected', () => {
                    socket.emit('leave-room', ({ roomId, user: newUser, isPresentation }));
                })
                return { stream, peer, user: newUser };
            })
    }
    const getNewStream = useMemo(() => (stream: MediaStream, user: User, isMuted=false, hasCamera=true, connecting=false, isPinned=false, isPresentation=false) => {
        return {
            stream,
            user,
            isMuted,
            hasCamera,
            connecting,
            isPinned,
            disconnected: false,
            selfMuted: false,
            isPresentation
        }
    }, []);
    const answerCall = useMemo(() => (call: Peer.MediaConnection, stream: MediaStream, isMuted?: boolean, hasCamera?: boolean, isPresentation?: boolean) => {
        if(isMuted) stream.getAudioTracks()[0].enabled = false;
        if(!hasCamera) stream.getVideoTracks()[0].enabled = false;
        call.answer(stream);
        if(isPresentation) return;

        const { isMuted: userIsMuted, hasCamera: userHasCamera, user } = call.metadata;

        // Preventing duplication
        let list: any = {};
        call.on('stream', userVideoStream => {
            if(list[call.peer]) return;
            list[call.peer] = call;
            const stream = getNewStream(userVideoStream, user, userIsMuted, userHasCamera);
            setStreams(previous => {
                if(previous.filter(s => s.user.id === stream.user.id).length) return previous;
                return [...previous, ...[stream]];
            });
        })
    }, []);

    useEffect(() => {
        requestUserMedia().then(stream => {
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
    const initiateRoomConnection = async () => {
        // Saving all calls for when we close 
        const calls: any = {};

        const { stream, peer, user: newUser } = await createMemberConnection(socket, user, isMutedRef.current, hasCameraRef.current);
        selfUser.current = newUser;
        setSelfStream(stream);
        
        // Answer calls if received
        peer.on('call', call => {
            answerCall(call, stream, isMutedRef.current, hasCameraRef.current);
        })

        // Handling users muting themselves
        socket.on('toggle-mute', ({ isMuted, streamId, userId }: any) => {
            setStreams(previous => {
                const newStreams = previous.map(stream => {
                    if(stream.stream.id == streamId) {
                        stream.isMuted = isMuted;
                    }
                    if(stream.user.id === userId) {
                        stream.isMuted = isMuted;
                    }
                    return stream;
                })
                return newStreams;
            })
        })
        // Handling users enabling camera
        socket.on('toggle-camera', ({ hasCamera, streamId, userId }: any) => {
            setStreams(previous => {
                const newStreams = previous.map(stream => {
                    if(stream.stream.addEventListener == streamId) {
                        stream.hasCamera = hasCamera;
                    }
                    if(stream.user.id === userId) {
                        stream.hasCamera = hasCamera;
                    }
                    return stream;
                })
                return newStreams;
            })
        })

        // Handling users joining
        let callList: any = {};
        socket.on('user-connected', ({ user, isMuted, hasCamera, isPresentation }: any) => {
            console.log(`User connected: ${user.id}`)
            setFeedback(!isPresentation ? `${user.username} connected` : `${user.username} is presenting`);

            const call = peer.call(user.id, stream, {
                metadata: {
                    user: newUser,
                    isMuted: isMutedRef.current,
                    hasCamera: hasCameraRef.current
                }
            });
            let userStream: null | MediaStream = null;
            const callList: any = {};
            call.on('stream', userVideoStream => {
                if(callList[call.peer]) return;
                callList[call.peer] = call;
                userStream = userVideoStream;
                const stream = getNewStream(userVideoStream, user, isMuted, hasCamera, true, isPresentation, isPresentation);
                setStreams(previous => {
                    if(isPresentation) previous.forEach(stream => stream.isPinned = false);
                    return [...previous, ...[stream]];
                });
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
        })

        // Handling users leaving
        socket.on('user-disconnected', ({ user, isPresentation }) => {
            console.log('User disconnected');
            animateUserDisconnection(user.id);
            setFeedback(!isPresentation ? `${user.username} disconnected` : `${user.username} stopped presenting`);
        })
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

    const present = useMemo(() => async (state: MediaStream | null) => {
        if(!state) {
            const shareSocket = io('http://localhost:3001');
            const { peer, stream, user } = await createMemberConnection(shareSocket, selfUser.current, false, true, 'getDisplayMedia', true);

            peer.on('open', id => {
                presentationPeer.current = peer;
                setPresentation(stream);
            })
            peer.on('call', call => {
                answerCall(call, stream, false, true, true);
            })
            peer.on('disconnected', () => {
                shareSocket.close();
            })
            stream.getTracks()[0].addEventListener('ended', () => {
                presentationPeer.current.disconnect();
                setPresentation(previous => {
                    previous?.getTracks().forEach(track => track.stop());
                    return null;
                });
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