import { createContext, useContext, useMemo, useState } from "react"
import { DeviceContext as DeviceContextType } from "../types/DeviceContext";

const DeviceContext = createContext<DeviceContextType>({devices: {video: '', audio: ''}, updateDevice: () => {}});

export const useDevice = () => {
    return useContext(DeviceContext);
}

interface Props {
    children: any;
}
const getInitialState = () => {
    let devices;
    try {
        const { audio, video } = JSON.parse(window.localStorage.devices);
        devices = {audio, video};
    } catch(e) {
        devices = {
            audio: 'default',
            video: 'default'
        }
    }
    return devices;
}
export const DeviceProvider: React.FC<Props> = ({ children }) => {
    const [devices, setDevices] = useState(getInitialState())

    const updateDevice = (type: 'audio' | 'video', deviceId: string) => {
        let devicesObject;
        try {
            devicesObject = JSON.parse(window.localStorage.devices);
        } catch(e) {
            devicesObject = {
                audio: 'default',
                video: 'default'
            }
        }
        devicesObject[type] = deviceId;
        localStorage.devices = JSON.stringify(devicesObject);
        setDevices(previous => {return {...previous, ...{[type]: deviceId}}})
    }

    const value = {
        devices,
        updateDevice
    }

    return(
        <DeviceContext.Provider value={value}>
            {children}
        </DeviceContext.Provider>
    )
}