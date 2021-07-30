import { Flex } from "../../components/Flex";
import { useAttachments } from "../../contexts/AttachmentProvider";
import { useChat } from "../../contexts/ChatProvider";
import { useModal } from "../../contexts/ModalProvider";
import { useRoom } from "../../contexts/RoomProvider"
import { useSidebar } from "../../contexts/SidebarProvider";
import { SettingsModal } from "../../modals/SettingsModal";
import { AttachmentIcon } from "../../icons/AttachmentIcon";
import { CameraButton } from "./CameraButton";
import { ControlButton } from "./ControlButton";
import { MicButton } from "./MicButton";
import { RecordIcon } from "../../icons/RecordIcon";
import { UnreadMarker } from "./UnreadMarker";
import { PresentIcon } from "../../icons/PresentIcon";
import { LeaveIcon } from "../../icons/LeaveIcon";
import { ChatIcon } from "../../icons/ChatIcon";

export const Controls = () => {
    const { toggleMute, toggleCamera, isMuted, hasCamera, leaveRoom, present, presentation, record, isRecording } = useRoom();
    const { unread } = useChat();
    const { newAttachments } = useAttachments();
    const { toggleSidebar, open, type } = useSidebar();
    const { setModal } = useModal();

    return(
        <Flex className="controls" justifyContent={'space-between'}>
            <Flex className="center">
                <MicButton 
                    isMuted={isMuted}
                    toggleMute={toggleMute}
                />
                <CameraButton
                    hasCamera={hasCamera}
                    toggleCamera={toggleCamera}
                />
                <ControlButton 
                    tooltip={!presentation ? 'Present to Everyone' : 'Stop Presentation'}
                    active={presentation !== null}
                    onClick={() => present(presentation)}
                >
                    <PresentIcon />
                </ControlButton>
                <ControlButton
                    tooltip={!isRecording ? 'Record Meeting' : 'Stop Recording'}
                    active={isRecording !== null}
                    onClick={() => record(isRecording ? false : true)}
                >
                    <RecordIcon />
                </ControlButton>
                <ControlButton 
                    active={true}
                    onClick={leaveRoom}
                    tooltip={'Leave Meeting'}
                >
                    <LeaveIcon />
                </ControlButton>
            </Flex>
            <Flex className="right">
                <ControlButton
                    active={false}
                    onClick={() => setModal(<SettingsModal />)}
                    tooltip={'Open Settings'}
                >
                    Settings
                </ControlButton>
                <ControlButton
                    active={open && type === 'attachments'}
                    onClick={() => toggleSidebar(!open, 'attachments')}
                    tooltip={!newAttachments ? 'Attachments' : null}
                >
                    {newAttachments && (
                        <span className="new-attachments">
                            There are new attachments
                        </span>
                    )}
                    <AttachmentIcon />
                </ControlButton>
                <ControlButton
                    active={open && type === 'chat'}
                    onClick={() => toggleSidebar(!open, 'chat')}
                    tooltip={`${open && type === 'chat' ? 'Close' : 'Open'} chat`}
                >
                    <ChatIcon />
                    {unread !== 0 && (
                        <UnreadMarker 
                            amount={unread}
                        />
                    )}
                </ControlButton>
            </Flex>
        </Flex>
    )
}