import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Attachment } from "../types/Attachment";
import { AttachmentContext as AttachmentContextType } from "../types/AttachmentContext";
import { generateId } from "./RoomProvider";
import { useSidebar } from "./SidebarProvider";

const AttachmentContext = createContext<AttachmentContextType>({attachments: [], addAttachment: () => {}, newAttachments: false});

export const useAttachments = () => {
    return useContext(AttachmentContext)
}

interface Props {
    children: any;
}
export const AttachmentProvider: React.FC<Props> = ({ children }) => {
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [newAttachments, setNewAttachments] = useState(false);
    const { open, type } = useSidebar();

    const addAttachment = useMemo(() => (type: 'video', source: string | MediaStream, downloadable=true) => {
        const id = generateId();
        const name = `Attachment-${Date.now()}`;
        const attachment = {type, source, isDownloadable: downloadable, id, name};
        setAttachments(previous => [...previous, ...[attachment]]);
        setNewAttachments(true);
    }, []);

    useEffect(() => {
        if(open && type === 'attachments' && newAttachments) {
            setNewAttachments(false);
        }
    }, [open, type, newAttachments]);

    const value = {
        attachments,
        addAttachment,
        newAttachments
    }

    return(
        <AttachmentContext.Provider value={value}>
            {children}
        </AttachmentContext.Provider>
    )
}