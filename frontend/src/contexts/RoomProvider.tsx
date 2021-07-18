import { createContext, useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from 'socket.io-client';
import Peer from 'peerjs';
import { User } from "../types/User";
import { Stream } from "../types/Stream";

const socket: any = io('http://localhost:3001');
const peer = new Peer(undefined, {
    host: '/',
    port: 3002
})

interface ContextType {
    roomId: string | undefined;
    selfStream: null | MediaStream;
    streams: Stream[];
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
    const [selfStream, setSelfStream] = useState<null | MediaStream>(null);
    const [streams, setStreams] = useState<Stream[]>([]);

    useEffect(() => {
        peer.on('open', id => {
            socket.emit('join-room', {roomId, user: {name: 'Poxen', id}})
        })

        // Asking user for webcam and mic
        navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        }).then(stream => {
            setSelfStream(stream)

            let streamList: any = {};
            peer.on('call', call => {
                call.answer(stream);
                const user: User = call.metadata.user;

                call.on('stream', userVideoStream => {
                    if(streamList[call.peer]) return;
                    streamList[call.peer] = call;
                    setStreams(previous => [...previous, ...[{stream: userVideoStream, user}]]);
                })
            })

            let callList: any = {};
            socket.on('user-connected', (user: User) => {
                console.log(`User connected: ${user.id}`)
                setTimeout(() => {
                    const call = peer.call(user.id, stream, {
                        metadata: {
                            user
                        }
                    });
                    let userStream: null | MediaStream = null;
                    call.on('stream', userVideoStream => {
                        if(callList[call.peer]) return;
                        userStream = userVideoStream;
                        setStreams(previous => [...previous, ...[{stream: userVideoStream, user}]]);
                        callList[call.peer] = call;
                    })
                    call.on('close', () => {
                        setStreams(previous => previous.filter(s => s.stream !== userStream));
                    })
                    call.on('error', error => {
                        console.log(error);
                    })
                }, 1000);
            })
        });

        return () => socket.close();
    }, [])

    const value = {
        roomId,
        selfStream,
        streams
    }
    
    return(
        <RoomContext.Provider value={value}>
            {children}
        </RoomContext.Provider>
    )
}