import { Button } from "../../components/Button"
import { Modal } from "../../components/Modal"
import { ModalFooter } from "../../components/ModalFooter"
import { ModalHeader } from "../../components/ModalHeader"
import { useModal } from "../../contexts/ModalProvider"

interface Props {
    video: string;
}

export const RecordedVideoModal: React.FC<Props> = ({ video }) => {
    const { close } = useModal();

    return(
        <Modal>
            <div className="recorded-video-modal">
                <ModalHeader text={`Recorded Meeting`} />
                <video src={video} controls></video>
                <ModalFooter>
                    <Button type={'secondary'} onClick={close}>
                        Close
                    </Button>
                    <a href={video} target="_blank" download={`meeting-recording-${Date.now().toString()}`}>
                        <Button>
                            Save video
                        </Button>
                    </a>
                </ModalFooter>
            </div>
        </Modal>
    )
}