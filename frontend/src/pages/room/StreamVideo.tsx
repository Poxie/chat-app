import { memo, useEffect, useRef } from "react";
import hark from 'hark';
import { LoadingIcon } from "../../components/LoadingIcon";
import { Flex } from "../../components/Flex";

interface Props {
    stream: MediaStream | null;
    setIsSpeaking?: (state: boolean) => void;
    isSelfStream?: boolean;
    selfMuted?: boolean;
}

export const StreamVideo: React.FC<Props> = memo(({ setIsSpeaking, stream, isSelfStream, selfMuted }) => {
    const ref = useRef<null | HTMLVideoElement>(null);

    useEffect(() => {
        if(!ref.current || !stream) return;
        
        ref.current.srcObject = stream;
        if(!setIsSpeaking) return;
        ref.current.addEventListener('loadedmetadata', () => {
            ref.current?.play();
            if(!ref.current) return;
            let speechEvents
            try {
                speechEvents = hark(stream);
            } catch(e) {
                return;
            };

            speechEvents.on('speaking', () => {
                setIsSpeaking(true);
            })
            speechEvents.on('stopped_speaking', () => {
                setIsSpeaking(false);
            })
        })
    }, [stream]);
    
    if(!stream) {
        return(
            <Flex className="loading-stream" alignItems={'center'} justifyContent={'center'} style={{width: '100%', height: '100%'}}>
                <LoadingIcon />
            </Flex>
        )
    }

    return(
        <video ref={ref} muted={isSelfStream || selfMuted}></video>
    )
});