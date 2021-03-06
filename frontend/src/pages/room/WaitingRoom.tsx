import { useEffect, useRef, useState } from "react"
import { Flex } from "../../components/Flex";
import { useAuthentication } from "../../contexts/AuthenticationProvider";
import { useRoom } from "../../contexts/RoomProvider";
import { CameraButton } from "./CameraButton";
import { MicButton } from "./MicButton";
import { Stream } from "./Stream";
import { WaitingHeader } from "./WaitingHeader";

export const WaitingRoom = () => {
    const { selfStream, hasCamera, isMuted, toggleCamera, toggleMute, joinRoom, socket, roomId } = useRoom();
    const { user } = useAuthentication();
    const [members, setMembers] = useState<null | number>(null);

    useEffect(() => {
        socket.on('member-update', (members: number) => {
            setMembers(members);
        })
        socket.emit('listen-to-room', roomId);

        return () => {
            socket.emit('stop-listening')
            socket.off('member-update');
        }
    }, []);

    const singular = members === 1;
    return(
        <Flex className="waiting-room" justifyContent={'center'}>
            <Flex className="waiting-container" alignItems={'center'}>
                <Flex className={'waiting-stream'} alignItems={'center'} flexDirection={'column'}>
                    <Stream 
                        hasCamera={hasCamera}
                        isMuted={isMuted}
                        stream={selfStream}
                        user={{username: user.username, id: JSON.stringify(Math.random())}}
                        isSelfStream={true}
                    />
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
                <WaitingHeader 
                    joinRoom={joinRoom}
                    members={members}
                    stream={selfStream}
                />
            </Flex>
        </Flex>
    )
}