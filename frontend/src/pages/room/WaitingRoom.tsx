import { useEffect, useRef } from "react"
import { Button } from "../../components/Button";
import { Clickable } from "../../components/Clickable";
import { Flex } from "../../components/Flex";
import { useRoom } from "../../contexts/RoomProvider";
import { CameraButton } from "./CameraButton";
import { ControlButton } from "./ControlButton";
import { MicButton } from "./MicButton";
import { Stream } from "./Stream";

export const WaitingRoom = () => {
    const { selfStream, hasCamera, isMuted, toggleCamera, toggleMute, joinRoom } = useRoom();

    return(
        <Flex className="waiting-room" justifyContent={'center'}>
            <Flex className="waiting-container" alignItems={'center'} flexWrap={'wrap'}>
                <Flex alignItems={'center'} flexDirection={'column'}>
                    {selfStream && (
                        <Stream 
                            hasCamera={hasCamera}
                            isMuted={isMuted}
                            stream={selfStream}
                            user={{username: 'Poxen', id: String(Math.random())}}
                            isSelfStream={true}
                        />
                    )}
                    <Flex className="waiting-controls">
                        <MicButton 
                            isMuted={isMuted}
                            toggleMute={toggleMute}
                        />
                        <CameraButton 
                            hasCamera={hasCamera}
                            toggleCamera={toggleCamera}
                        />
                    </Flex>
                </Flex>
                <Flex className="header" flexDirection={'column'} alignItems={'center'}>
                    <span>
                        Ready to join the meeting?
                    </span>
                    <Button rounded={true} onClick={joinRoom}>
                        Join meeting
                    </Button>
                </Flex>
            </Flex>
        </Flex>
    )
}