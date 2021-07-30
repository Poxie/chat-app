import { useEffect, useState } from "react"
import { Button } from "../../components/Button";
import { Dropdown } from "../../components/Dropdown";
import { Flex } from "../../components/Flex";
import { Modal } from "../../components/Modal"
import { ModalFooter } from "../../components/ModalFooter";
import { ModalHeader } from "../../components/ModalHeader";
import { useModal } from "../../contexts/ModalProvider";
import { SettingsDropdown } from "./SettingsDropdown";

export const SettingsModal = () => {
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
    const { close } = useModal();

    useEffect(() => {
        navigator.mediaDevices.enumerateDevices().then(setDevices);
    }, []);

    const voice = devices.filter(device => device.kind === 'audioinput');
    const video = devices.filter(device => device.kind === 'videoinput');

    return(
        <Modal>
            <ModalHeader
                text={'Device Settings'}
            >
                <SettingsDropdown 
                    devices={voice}
                    header={'Microphone'}
                />
                <SettingsDropdown 
                    devices={video}
                    header={'Camera'}
                />
            </ModalHeader>
            <ModalFooter>
                <Button onClick={close}>
                    Close
                </Button>
            </ModalFooter>
        </Modal>
    )
}