import { Button } from "../components/Button";
import { Modal } from "../components/Modal";
import { ModalFooter } from "../components/ModalFooter";
import { ModalHeader } from "../components/ModalHeader";
import { useModal } from "../contexts/ModalProvider";

interface Props {
    title: string;
    description: string;
}
export const WarningModal: React.FC<Props> = ({ title, description }) => {
    const { close } = useModal();

    return(
        <Modal>
            <ModalHeader 
                text={title}
                description={description}
            />
            <ModalFooter>
                <Button onClick={close}>
                    I understand
                </Button>
            </ModalFooter>
        </Modal>
    )
}