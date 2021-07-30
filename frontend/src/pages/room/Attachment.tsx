import { useEffect, useRef } from "react"
import { Button } from "../../components/Button";
import { Attachment as AttachmentType } from "../../types/Attachment"

export const Attachment = ({ type, source, isDownloadable, name }: AttachmentType) => {
    const ref = useRef<HTMLVideoElement | null>(null)

    useEffect(() => {
        if(!ref.current) return;
        if(typeof source !== 'string') {
            ref.current.srcObject = source;
        }
    }, [source]);

    return(
        <div className="attachment">
            <span className="header">
                {name}
            </span>
            <video controls src={typeof source === 'string' ? source : ''}></video>
            <a href={typeof source === 'string' ? source : ''} target="_blank" download={name}>
                <Button>
                    Download
                </Button>
            </a>
        </div>
    )
}