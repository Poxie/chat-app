import { useEffect, useRef } from "react"
import { User } from "../../types/User";

interface Props {
    stream: MediaStream;
    user: User;
}

export const Stream: React.FC<Props> = ({ stream }) => {
    const ref = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        if(!ref.current) return;
        
        ref.current.srcObject = stream;
        ref.current.addEventListener('loadedmetadata', () => {
            ref.current?.play();
        })
    }, []);
    return(
        <div className="stream">
            <video src="undefined" ref={ref}></video>
        </div>
    )
}