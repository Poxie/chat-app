import { createContext, DispatchWithoutAction, useContext, useEffect, useMemo, useReducer, useRef, useState } from "react";
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
import { useModal } from "./ModalProvider";
import { RecordedVideoModal } from "../pages/room/RecordedVideoModal";
import { useAttachments } from "./AttachmentProvider";
import { WEBSOCKET_ENDPOINT, PEER_SERVER_ENDPOINT } from '../config.json';
import { WarningModal } from "../pages/room/WarningModal";

const socket = io(WEBSOCKET_ENDPOINT);

declare var MediaRecorder: any;
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
    record: (state: boolean) => void;
    isRecording: null | typeof MediaRecorder;
    isCurrentlyRecording: false | User;
    [x: string]: any;
}
// @ts-ignore
const RoomContext = createContext<ContextType>(null);

export const useRoom = () => {
    return useContext(RoomContext);
}

export const generateId = () => {
    let id = '';
    const opts = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for(let i = 0; i < 50; i++) {
        id += opts[Math.floor(Math.random() * (opts.length - 1))];
    }
    return id;
}

interface States {
    selfStream: null | MediaStream;
    presentation: any,
    streams: Stream[];
    isMuted: boolean;
    hasCamera: boolean;
    isConnected: boolean;
    isRecording: null | typeof MediaRecorder;
    isCurrentlyRecording: false | User;
    [x: string]: any;
}
const initialState: States = {
    selfStream: null,
    presentation: null,
    streams: [],
    isMuted: false,
    hasCamera: true,
    isConnected: false,
    isRecording: null,
    isCurrentlyRecording: false
}
const init = (initialState: States) => {
    return initialState;
}
interface ReducerAction {
    type?: any;
    property: any;
    payload: any;
}

const reducer = (state: States, action: ReducerAction) => {
    if(!state) return initialState;
    if(!action) return state;
    if(!action.type) action.type = 'simple-property';
    const { type, property, payload } = action;

    const updateState = (property: string, value: any) => {
        return {...state, ...{[property]: value}};
    }

    switch(type) {
        case 'simple-property':
            return updateState(property, payload);
        case 'close-presentation':
            state[property].getTracks().forEach((track: MediaStreamTrack) => track.stop());
            return updateState(property, payload);
        case 'add-stream':
            if(payload.isPinned) state.streams.forEach(stream => stream.isPinned = false);
            const streams = [...state.streams, ...[payload]];
            return updateState('streams', streams);
        case 'remove-stream': {
            const newStreams = state.streams.filter(stream => {
                if(stream.user.id !== payload) {
                    return stream;
                } else {
                    if(!stream.stream) return stream;
                    stream.stream.getTracks().forEach(track => track.stop());
                }
            })
            return updateState('streams', newStreams);
        }
        case 'stream-property': {
            const newStreams = state.streams.map(stream => {
                if(stream.user.id === payload.userId || stream?.stream?.id === payload.streamId) {
                    // @ts-ignore
                    stream[payload.property] = payload.value;
                } else {
                    if(payload.property === 'isPinned') {
                        stream.isPinned = false;
                    }
                }
                return stream;
            })
            return updateState('streams', newStreams);
        }
        case 'leave-room':
            const { isMuted, hasCamera, selfStream } = state;
            const newState = {...initialState, ...{
                isMuted,
                hasCamera,
                selfStream
            }}
            return init(newState);
        default:
            return state;
    }
}

interface Props {
    children: any;
}
export const RoomProvider: React.FC<Props> = ({ children }) => {
    const { roomId } = useParams<Params>();
    const { user } = useAuthentication();
    const { setModal } = useModal();
    const { setFeedback } = useFeedback();
    const { devices } = useDevice();
    const { addAttachment } = useAttachments();
    
    const [state, dispatch] = useReducer(reducer, initialState, init);
    const { selfStream, streams, isConnected, isRecording, isCurrentlyRecording } = state;

    const presentationPeer = useRef<any>(null);
    const selfUser = useRef<any>(null);
    const isMutedRef = useRef(false);
    const hasCameraRef = useRef(true);
    const devicesRef = useRef(devices);
    const changeDevice = useRef<null | (() => void)>(null);
    const recordedChunks = useRef<any>([]);

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
    const enabledAudio = useMemo(() => (stream: MediaStream, state: boolean | 'toggle') => {
        const track = stream.getAudioTracks()[0];
        track.enabled = state === 'toggle' ? !track.enabled : state;
        return !track.enabled;
    }, []);
    const enabledVideo = useMemo(() => (stream: MediaStream, state: boolean | 'toggle') => {
        const track = stream.getVideoTracks()[0];
        track.enabled = state === 'toggle' ? !track.enabled : state;
        return track.enabled;
    }, []);

    const createMemberConnection = async (socket: Socket<DefaultEventsMap>, user: ContextUser, isMuted=false, hasCamera=true, type: 'getUserMedia' | 'getDisplayMedia'='getUserMedia', isPresentation=false) => {
        return requestUserMedia(type)
            .then(stream => {
                const id = generateId();
                const peer = new Peer(id, {
                    host: PEER_SERVER_ENDPOINT,
                    secure: true
                })
                let newUser = {...user, ...{id}};
                peer.on('open', id => {
                    socket.emit('join-room', {roomId, isMuted, hasCamera, user: newUser, isPresentation});
                })
                peer.on('disconnected', () => {
                    socket.emit('leave-room', ({ roomId, user: newUser, isPresentation }));
                })

                // Muting stream if isMuted is true
                if(isMuted) enabledAudio(stream, false);
                // Disabling camera if hasCamera is false
                if(!hasCamera) enabledVideo(stream, false);
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
        if(isMuted) enabledAudio(stream, false);
        if(!hasCamera) enabledVideo(stream, false);
        call.answer(stream);
        if(isPresentation) return;

        const { isMuted: userIsMuted, hasCamera: userHasCamera, user, isPresentation: streamIsPresentation } = call.metadata;

        // Preventing duplication
        let list: any = {};
        call.on('stream', userVideoStream => {
            if(list[call.peer]) return;
            list[call.peer] = call;
            const stream = getNewStream(userVideoStream, user, userIsMuted, userHasCamera, false, streamIsPresentation, streamIsPresentation);
            console.log(streamIsPresentation);
            dispatch({type: 'add-stream', property: 'streams', payload: stream});
        })
    }, []);

    // Initiate device permission
    useEffect(() => {
        dispatch({property: 'selfStream', payload: null});
        requestUserMedia().then(stream => {
            dispatch({property: 'selfStream', payload: stream});
        });
    }, [roomId]);

    const leaveRoom = useMemo(() => () => {
        const { id, username } = selfUser.current;
        socket.emit('leave-room', {roomId, user: {username, id}});

        dispatch({type: 'leave-room', property: null, payload: null});
    }, [roomId]);
    const joinRoom = useMemo(() => () => {
        dispatch({property: 'isConnected', payload: true});
        initiateRoomConnection();
    }, []);
    const initiateRoomConnection = async () => {
        // Creating peer connection
        const { stream, peer, user: newUser } = await createMemberConnection(socket, user, isMutedRef.current, hasCameraRef.current);
        selfUser.current = newUser;
        dispatch({property: 'selfStream', payload: stream});
        
        // Answer calls if received
        peer.on('call', call => {
            answerCall(call, stream, isMutedRef.current, hasCameraRef.current);
        })

        // Handling users toggling microphone
        socket.on('toggle-mute', ({ isMuted, streamId, userId }: any) => {
            dispatch({type: 'stream-property', property: 'isMuted', payload: {userId, streamId, property: 'isMuted', value: isMuted}})
        })
        // Handling users toggling camera
        socket.on('toggle-camera', ({ hasCamera, streamId, userId }: any) => {
            dispatch({type: 'stream-property', property: 'hasCamera', payload: {userId, streamId, property: 'hasCamera', value: hasCamera}})
        })
        // Handling recordings
        socket.on('record-start', ({ user }) => {
            dispatch({property: 'isCurrentlyRecording', payload: user});
        })
        socket.on('record-stop', ({ user, blob, canceled }) => {
            dispatch({property: 'isCurrentlyRecording', payload: false});
            if(canceled) return setFeedback(`${user.username} canceled the recording.`);
            setFeedback(`${user.username} stopped recording`);
            addAttachment('video', blob, true);
        })

        // Handling users joining
        socket.on('user-connected', ({ user, isMuted, hasCamera, isPresentation }: any) => {
            setFeedback(!isPresentation ? `${user.username} connected` : `${user.username} is presenting`);

            // Sending self stream to new user
            const call = peer.call(user.id, stream, {
                metadata: {
                    user: newUser,
                    isMuted: isMutedRef.current,
                    hasCamera: hasCameraRef.current,
                }
            });

            const callList: any = {};
            call.on('stream', userVideoStream => {
                if(callList[call.peer]) return;
                callList[call.peer] = call;
                const stream = getNewStream(userVideoStream, user, isMuted, hasCamera, true, isPresentation, isPresentation);
                dispatch({type: 'add-stream', property: 'streams', payload: stream});
            })
            
            // Making it possible to change device during meeting
            const deviceChange = () => {
                const { video, audio } = devicesRef.current;
                requestUserMedia('getUserMedia', video, audio).then(stream => {
                    if(isMutedRef.current) enabledAudio(stream, false);
                    if(!hasCameraRef.current) enabledVideo(stream, false);
                    call.peerConnection.getSenders()[0].replaceTrack(stream.getTracks()[0]);
                    dispatch({property: 'selfStream', payload: stream});
                })
            }
            changeDevice.current = deviceChange;
        })

        // Handling users leaving
        socket.on('user-disconnected', ({ user, isPresentation }) => {
            animateUserDisconnection(user.id);
            setFeedback(!isPresentation ? `${user.username} disconnected` : `${user.username} stopped presenting`);
        })
    };
    useEffect(() => {
        if(isConnected) return;

        // If disconnect, stop listening to events
        socket.off('user-disconnected');
        socket.off('user-connected');
        socket.off('toggle-mute');
        socket.off('toggle-camera');
    }, [isConnected])

    const animateUserDisconnection = useMemo(() => (userId: string) => {
        dispatch({type: 'stream-property', property: 'streams', payload: {userId, property: 'disconnected', value: true}});
    }, []);

    // Handling stream changes - mute, deafen, camera
    const toggleMute = useMemo(() => () => {
        if(!selfStream) return;
        const enabled = enabledAudio(selfStream, 'toggle');
        socket.emit('toggle-mute', ({ roomId, isMuted: enabled, streamId: selfStream.id, userId: selfUser.current?.id }))
        dispatch({property: 'isMuted', payload: enabled});
        isMutedRef.current = enabled;
    }, [selfStream, roomId]);
    const toggleCamera = useMemo(() => () => {
        if(!selfStream) return;
        const enabled = enabledVideo(selfStream, 'toggle');
        socket.emit('toggle-camera', ({ roomId, hasCamera: enabled, streamId: selfStream.id, userId: selfUser.current?.id }))
        dispatch({property: 'hasCamera', payload: enabled});
        hasCameraRef.current = enabled;
    }, [selfStream, roomId]);
    const setSelfMute = useMemo(() => (userId: string, state: boolean) => {
        dispatch({type: 'stream-property', property: 'streams', payload: {userId, property: 'selfMuted', value: state}});
    }, []);
    
    // Remove stream after disconnect animation
    const removeStream = useMemo(() => (userId: string) => {
        dispatch({type: 'remove-stream', property: 'streams', payload: userId});
    }, []);
    // Remove connecting status
    const setConnected = useMemo(() => (userId: string) => {
        dispatch({type: 'stream-property', property: 'streams', payload: {userId, property: 'connecting', value: false}});
    }, []);

    // Pinning streams
    const setPinned = useMemo(() => (userId: string | null) => {
        dispatch({type: 'stream-property', property: 'streams', payload: {userId, property: 'isPinned', value: userId !== null}});
    }, []);

    // Toggle screenshare
    const present = useMemo(() => async (state: MediaStream | null) => {
        if(!state) {
            // Making sure only one screenshare is on at a time
            const currentPresentation = streams.filter(stream => stream.isPresentation)[0];
            if(currentPresentation) {
                return setModal(
                    <WarningModal 
                        title={'Too many presentations'}
                        description={`Unfortunately, due to screenshares being extremely resource demanding, only one person may present at a time. Ask ${currentPresentation.user.username} to stop presenting.`}
                    />
                )
            }

            // Creating a new connection for the screenshare
            const shareSocket = io(WEBSOCKET_ENDPOINT, {secure: true});
            const { peer, stream, user } = await createMemberConnection(shareSocket, selfUser.current, false, true, 'getDisplayMedia', true);

            // If user join, send persentation to them as well
            shareSocket.on('user-connected', ({ user: connectedUser }) => {
                peer.call(connectedUser.id, stream, {
                    metadata: {
                        user,
                        isMuted: false,
                        hasCamera: true,
                        isPresentation: true
                    }
                });
            });
            peer.on('open', id => {
                presentationPeer.current = peer;
                dispatch({property: 'presentation', payload: stream});
            })
            peer.on('call', call => {
                answerCall(call, stream, false, true, true);
            })
            peer.on('disconnected', () => {
                shareSocket.close();
            })

            // Checking for stream end (without click of stream button)
            stream.getTracks()[0].addEventListener('ended', () => {
                presentationPeer.current.disconnect();
                dispatch({type: 'close-presentation', property: 'presentation', payload: null});
            })
        } else {
            // Closing screenshare connection
            if(!presentationPeer.current) return;
            presentationPeer.current.disconnect();
            dispatch({type: 'close-presentation', property: 'presentation', payload: null});
        }
    }, [streams]);

    // Toggle record meeting
    const record = useMemo(() => async (state: boolean, recording?: any) => {
        if(!selfStream) return;
        if(state) {
            if(isCurrentlyRecording) {
                return setModal(
                    <WarningModal 
                        title={'Too many recordings'}
                        description={'Another person in this meeting is already recording. You may not start recording while there\'s another recording running.'}
                    />
                )
            }

            recordedChunks.current = [];
            const stream = await requestUserMedia('getDisplayMedia');

            // Telling the other participants
            socket.emit('record-start', ({ roomId, user: selfUser.current }));
            dispatch({property: 'isCurrentlyRecording', payload: selfUser.current});

            // Adding a cancel check
            let canceledRecording = false;
            stream.getTracks()[0].onended = () => canceledRecording = true;

            await new Promise((resolve, reject) => setTimeout(() => resolve(true), 5000));

            // If cancel, notify everyone and return
            if(canceledRecording) {
                socket.emit('record-stop', ({ roomId, user: selfUser.current, canceled: true }));
                dispatch({property: 'isCurrentlyRecording', payload: false});
                setFeedback('You canceled the recording.');
                return;
            }

            // Merging all audio devices
            const audioContext = new AudioContext();

            const destination = audioContext.createMediaStreamDestination();
            const audioSources = streams.map(s => s?.stream?.getAudioTracks()[0]);
            const audioSourcesTracks: MediaStreamAudioSourceNode[] = [];
            audioSources.forEach(track => {
                if(track) {
                    audioSourcesTracks.push(audioContext.createMediaStreamSource(new MediaStream([track])));
                }
            });
            audioSourcesTracks.forEach(source => source.connect(destination));

            const selfSource = audioContext.createMediaStreamSource(new MediaStream([selfStream.getAudioTracks()[0]]));
            selfSource.connect(destination);

            // Merging audio devices with video
            let tracks: any = [];
            tracks = tracks.concat(destination.stream.getTracks());
            tracks = tracks.concat(stream.getTracks());
            const newStream = new MediaStream(tracks);
            
            // Record the newly merged video/audio tracks
            const recorder = new MediaRecorder(newStream);
            recorder.start();
            recorder.ondataavailable = (e: any) => recordedChunks.current.push(e.data);
            dispatch({property: 'isRecording', payload: {recorder, stream}});

            // Generating video if you click on stop browser notification
            stream.getTracks()[0].onended = () => {
                record(false, {recorder, stream});
            };
        } else {
            if(!isRecording && !recording) return;
            if(isRecording) {
                isRecording.recorder.stop();
            } else {
                recording.recorder.stop();
            }
            generateRecordedVideo(recording || isRecording);
        }
    }, [isCurrentlyRecording, isRecording, streams, selfStream]);

    const generateRecordedVideo = useMemo(() => (isRecording: any) => {
        isRecording.stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());

        setTimeout(() => {
            var blob = new Blob(recordedChunks.current, {
                type: "video/webm"
            });
            var url = URL.createObjectURL(blob);

            // Notifying participants of record event
            socket.emit('record-stop', ({ user: selfUser.current, roomId, blob: url }));

            // Adding to attachment context
            addAttachment('video', url, true);

            setModal(<RecordedVideoModal video={url} />)

            dispatch({property: 'isRecording', payload: null});
            dispatch({property: 'isCurrentlyRecording', payload: false});
        }, 100);
    }, []);

    const value = {...state,
        ...{
            roomId,
            toggleMute,
            toggleCamera,
            removeStream,
            socket,
            setConnected,
            joinRoom,
            leaveRoom,
            setPinned,
            setSelfMute,
            present,
            record,
        }
    }
    
    return(
        <RoomContext.Provider value={value}>
            {children}
        </RoomContext.Provider>
    )
}