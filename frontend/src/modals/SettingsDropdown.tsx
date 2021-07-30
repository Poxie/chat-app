import { Dropdown } from "../components/Dropdown";
import { useDevice } from "../contexts/DeviceProvider";


interface Props {
    devices: MediaDeviceInfo[];
    header: string;
}
export const SettingsDropdown: React.FC<Props> = ({ devices, header }) => {
    const { updateDevice, devices: contextDevices } = useDevice();
    const deviceType = header === 'Microphone' ? 'audio' : 'video';

    const handleChange = (deviceId: string) => {
        updateDevice(deviceType, deviceId);
    }

    return(
        <div className="device-setting">
            <span className="header">
                {header}
            </span>
            <Dropdown
                tabs={devices.map(device => {return {id: device.deviceId, label: device.label}})}
                active={devices.length === 1 ? devices[0].deviceId : contextDevices[deviceType]}
                onChange={handleChange}
            />
        </div>
    )
}