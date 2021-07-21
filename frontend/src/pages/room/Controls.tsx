import { Flex } from "../../components/Flex";
import { useChat } from "../../contexts/ChatProvider";
import { useRoom } from "../../contexts/RoomProvider"
import { CameraButton } from "./CameraButton";
import { ControlButton } from "./ControlButton";
import { IsMutedIcon } from "./IsMutedIcon";
import { MicButton } from "./MicButton";

export const Controls = () => {
    const { toggleMute, toggleCamera, isMuted, hasCamera, leaveRoom } = useRoom();
    const { setOpen, open } = useChat();

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
                    active={true}
                    onClick={leaveRoom}
                    tooltip={'Leave meeting'}
                >
                    <svg aria-hidden="false" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M21.1169 1.11603L22.8839 2.88403L19.7679 6.00003L22.8839 9.11603L21.1169 10.884L17.9999 7.76803L14.8839 10.884L13.1169 9.11603L16.2329 6.00003L13.1169 2.88403L14.8839 1.11603L17.9999 4.23203L21.1169 1.11603ZM18 22H13C6.925 22 2 17.075 2 11V6C2 5.447 2.448 5 3 5H7C7.553 5 8 5.447 8 6V10C8 10.553 7.553 11 7 11H6C6.063 14.938 9 18 13 18V17C13 16.447 13.447 16 14 16H18C18.553 16 19 16.447 19 17V21C19 21.553 18.553 22 18 22Z"></path></svg>
                </ControlButton>
            </Flex>
            <div className="right">
                <ControlButton
                    active={open}
                    onClick={() => setOpen(!open)}
                    tooltip={`${open ? 'Close' : 'Open'} chat`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 3c5.514 0 10 3.592 10 8.007 0 4.917-5.144 7.961-9.91 7.961-1.937 0-3.384-.397-4.394-.644-1 .613-1.594 1.037-4.272 1.82.535-1.373.722-2.748.601-4.265-.837-1-2.025-2.4-2.025-4.872 0-4.415 4.486-8.007 10-8.007zm0-2c-6.338 0-12 4.226-12 10.007 0 2.05.739 4.063 2.047 5.625.055 1.83-1.023 4.456-1.993 6.368 2.602-.47 6.301-1.508 7.978-2.536 1.417.345 2.774.503 4.059.503 7.084 0 11.91-4.837 11.91-9.961-.001-5.811-5.702-10.006-12.001-10.006z"/></svg>
                </ControlButton>
            </div>
        </Flex>
    )
}