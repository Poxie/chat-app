import { memo, useEffect, useRef } from "react";
import hark from 'hark';

interface Props {
    stream: MediaStream;
    setIsSpeaking?: (state: boolean) => void;
    isSelfStream?: boolean;
    selfMuted?: boolean;
    isBackground?: boolean;
}

export const StreamVideo: React.FC<Props> = memo(({ setIsSpeaking, stream, isSelfStream, selfMuted, isBackground }) => {
    const ref = useRef<null | HTMLVideoElement>(null);

    useEffect(() => {
        if(!ref.current || !stream.id) return;
        
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
    }, []);

    return(
        <video ref={ref} className={isBackground ? 'background-video' : ''} muted={isSelfStream || selfMuted}></video>
    )
});