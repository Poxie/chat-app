import { createContext, useContext, useMemo, useState } from "react";
import { Attachment } from "../types/Attachment";
import { AttachmentContext as AttachmentContextType } from "../types/AttachmentContext";
import { generateId } from "./RoomProvider";

const AttachmentContext = createContext<AttachmentContextType>({attachments: [], addAttachment: () => {}});

export const useAttachments = () => {
    return useContext(AttachmentContext)
}

interface Props {
    children: any;
}
export const AttachmentProvider: React.FC<Props> = ({ children }) => {
    const [attachments, setAttachments] = useState<Attachment[]>([]);

    const addAttachment = useMemo(() => (type: 'video', source: string | MediaStream, downloadable=true) => {
        const id = generateId();
        const name = `Attachment-${Date.now()}`;
        const attachment = {type, source, isDownloadable: downloadable, id, name};
        setAttachments(previous => [...previous, ...[attachment]]);
    }, []);

    const value = {
        attachments,
        addAttachment
    }

    return(
        <AttachmentContext.Provider value={value}>
            {children}
        </AttachmentContext.Provider>
    )
}