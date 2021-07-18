import { useEffect, useRef, useState } from "react"
import { Flex } from "../../components/Flex";
import { User } from "../../types/User";
import { IsMutedIcon } from "./IsMutedIcon";
import { LetterIcon } from "./LetterIcon";
import hark from 'hark';

interface Props {
    stream: MediaStream;
    user: User;
    isMuted: boolean;
    hasCamera: boolean;
    isNavStream?: boolean
}

export const Stream: React.FC<Props> = ({ stream, user, hasCamera, isMuted, isNavStream=false }) => {
    const ref = useRef<HTMLVideoElement | null>(null);
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

    return(
        <div className={`user${isSpeaking ? ' is-speaking' : ''}`}>
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