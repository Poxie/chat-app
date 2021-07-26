export interface RequestMediaType {
    RequestUserMedia: (type?: 'getUserMedia' | 'getDisplayMedia', videoDeviceId?: string, audioDeviceId?: string) => Promise<MediaStream>;
}