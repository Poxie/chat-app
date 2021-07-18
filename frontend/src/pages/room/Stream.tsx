import { useEffect, useRef, useState } from "react"
import { Flex } from "../../components/Flex";
import { User } from "../../types/User";
import { IsMutedIcon } from "./IsMutedIcon";
import { LetterIcon } from "./LetterIcon";
import hark from 'hark';
import { useRoom } from "../../contexts/RoomProvider";

interface Props {
    stream: MediaStream;
    user: User;
    isMuted: boolean;
    hasCamera: boolean;
    disconnected?: boolean;
    isNavStream?: boolean;
    connecting?: boolean;
}

export const Stream: React.FC<Props> = ({ stream, user, hasCamera, isMuted, disconnected, connecting, isNavStream=false }) => {
    const { removeStream, setConnected } = useRoom();
    const ref = useRef<HTMLVideoElement | null>(null);
    const container = useRef<HTMLDivElement | null>(null);
    const [isSpeaking, setIsSpeaking] = useState(false);

    useEffect(() => {
        if(!ref.current) return;
        
        ref.current.srcObject = stream;
        ref.current.addEventListener('loadedmetadata', () => {
            ref.current?.play();
            if(!ref.current) return;
            const speechEvents = hark(stream);

            speechEvents.on('speaking', () => {
                setIsSpeaking(true);
            })
            speechEvents.on('stopped_speaking', () => {
                setIsSpeaking(false);
            })
        })
    }, []);

    useEffect(() => {
        if(disconnected === true) {
            setTimeout(() => {
                container.current?.classList.add('shrink');
                setTimeout(() => {
                    removeStream(user.id);
                }, 1000);
            }, 400);
        }
    }, [disconnected]);

    useEffect(() => {
        if(connecting) {
            setTimeout(() => {
                setConnected(user.id);
            }, 500);
        }
    }, [connecting]);

    return(
        <div className={`user${isSpeaking ? ' is-speaking' : ''}${disconnected ? ' disconnected' : ''}${connecting ? ' connecting' : ''}`} ref={container}>
            {!isNavStream && (
                <div className="user-top">
                    {isMuted && <IsMutedIcon />}
                </div>
            )}
            <Flex className="stream" alignItems={'center'}>
                {!hasCamera && (
                    <LetterIcon 
                        username={user.username}
                    />
                )}
                <video ref={ref} muted={isNavStream}></video>
            </Flex>
            {!isNavStream && (
                <div className="username">
                    {user.username}
                </div>
            )}
        </div>
    )
}