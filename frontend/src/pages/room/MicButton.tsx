import { IsMutedIcon } from "../../icons/IsMutedIcon"
import { NotMutedIcon } from "../../icons/NotMutedIcon"
import { ControlButton } from "./ControlButton"

interface Props {
    isMuted: boolean;
    toggleMute: () => void;
}

export const MicButton: React.FC<Props> = ({ isMuted, toggleMute }) => {
    return(
        <ControlButton
            active={isMuted}
            onClick={toggleMute}
            tooltip={isMuted ? 'Unmute' : 'Mute'}
        >
            {!isMuted ? (
                <NotMutedIcon />
            ) : (
                <IsMutedIcon />
            )}
        </ControlButton>
    )
}