export interface DeviceContext {
    devices: {
        audio: string,
        video: string
    };
    updateDevice: (type: 'audio' | 'video', deviceId: string) => void;
}