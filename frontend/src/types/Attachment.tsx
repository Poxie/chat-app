export interface Attachment {
    id: string;
    type: 'video';
    name: string;
    source: string | MediaStream;
    isDownloadable?: boolean;
}