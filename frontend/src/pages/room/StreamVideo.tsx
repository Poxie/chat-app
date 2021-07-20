import { memo, useEffect, useRef } from "react";
import hark from 'hark';

interface Props {
    setIsSpeaking: (state: boolean) => void;
    stream: MediaStream;
    isSelfStream?: boolean;
}

export const StreamVideo: React.FC<Props> = memo(({ setIsSpeaking, stream, isSelfStream }) => {
    const ref = useRef<null | HTMLVideoElement>(null);

    console.log('re-rendered');

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
        <video ref={ref} muted={isSelfStream}></video>
    )
});