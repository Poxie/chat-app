import { Button } from "../../components/Button"
import { useModal } from "../../contexts/ModalProvider"
import { CreateMeetingModal } from "../../modals/CreateMeetingModal";

export const CreateMeeting = () => {
    const { setModal } = useModal();

    return(
        <Button onClick={() => setModal(<CreateMeetingModal />)}>
            Create Meeting
        </Button>
    )
}