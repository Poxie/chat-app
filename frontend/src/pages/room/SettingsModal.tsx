import { useEffect, useState } from "react"
import { Button } from "../../components/Button";
import { Dropdown } from "../../components/Dropdown";
import { Flex } from "../../components/Flex";
import { Modal } from "../../components/Modal"
import { useModal } from "../../contexts/ModalProvider";
import { SettingsDropdown } from "./SettingsDropdown";

export const SettingsModal = () => {
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
    const [auto, setAuto] = useState(0);
    const { setModal } = useModal();

    useEffect(() => {
        navigator.mediaDevices.enumerateDevices().then(setDevices);
    }, []);

    const voice = devices.filter(device => device.kind === 'audioinput');
    const video = devices.filter(device => device.kind === 'videoinput');

    return(
        <Modal
            header={'Device Settings'}
        >
            <SettingsDropdown 
                devices={voice}
                header={'Microphone'}
            />
            <SettingsDropdown 
                devices={video}
                header={'Camera'}
            />
            <Flex justifyContent={'flex-end'} className="settings-button">
                <Button onClick={() => setModal(null)}>
                    Close
                </Button>
            </Flex>
        </Modal>
    )
}