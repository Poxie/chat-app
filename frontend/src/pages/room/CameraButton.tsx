import { CameraIcon } from "../../icons/CameraIcon"
import { ControlButton } from "./ControlButton"

interface Props {
    hasCamera: boolean;
    toggleCamera: () => void;
}

export const CameraButton: React.FC<Props> = ({ hasCamera, toggleCamera }) => {
    return(
        <ControlButton
            active={!hasCamera}
            onClick={toggleCamera}
            tooltip={hasCamera ? 'Turn off' : 'Turn on'}
        >
            <CameraIcon />
        </ControlButton>
    )
}