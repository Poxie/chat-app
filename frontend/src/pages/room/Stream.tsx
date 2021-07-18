import { useEffect, useRef } from "react"
import { Flex } from "../../components/Flex";
import { User } from "../../types/User";
import { IsMutedIcon } from "./IsMutedIcon";
import { LetterIcon } from "./LetterIcon";

interface Props {
    stream: MediaStream;
    user: User;
    isMuted: boolean;
    hasCamera: boolean;
    isNavStream?: boolean
}

export const Stream: React.FC<Props> = ({ stream, user, hasCamera, isMuted, isNavStream=false }) => {
    const ref = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        if(!ref.current) return;
        
        ref.current.srcObject = stream;
        ref.current.addEventListener('loadedmetadata', () => {
            ref.current?.play();
        })
    }, []);

    return(
        <div className="user">
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
                <video ref={ref}></video>
            </Flex>
            {!isNavStream && (
                <div className="username">
                    {user.username}
                </div>
            )}
        </div>
    )
}