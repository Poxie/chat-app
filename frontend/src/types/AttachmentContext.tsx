import { Attachment } from "./Attachment";

export interface AttachmentContext {
    attachments: Attachment[];
    addAttachment: (type: 'video', source: string | MediaStream, downloadable?: boolean) => void;
}