import { memo, useEffect, useRef } from "react";
import hark from 'hark';

interface Props {
    setIsSpeaking: (state: boolean) => void;
    stream: MediaStream;
    isSelfStream?: boolean;
    selfMuted?: boolean;
}

export const StreamVideo: React.FC<Props> = memo(({ setIsSpeaking, stream, isSelfStream, selfMuted }) => {
    const ref = useRef<null | HTMLVideoElement>(null);

    useEffect(() => {
        if(!ref.current || !stream.id) return;
        console.log(stream);
        
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
        <video ref={ref} muted={isSelfStream || selfMuted}></video>
    )
});