import { useState } from "react";
import { useAuthentication } from "../../contexts/AuthenticationProvider";
import { useRoom } from "../../contexts/RoomProvider";
import { MovableStream } from "./MovableStream";
import { Navbar } from "./Navbar"
import './Room.scss';
import { RoomView } from "./RoomView";
import { WaitingRoom } from "./WaitingRoom";

export const Room = () => {
    const { isConnected, selfStream, hasCamera, isMuted, isCurrentlyRecording } = useRoom();
    const { user } = useAuthentication();
    const [hasStreamPopup, setHasStreamPopup] = useState(true);

    return(
        <div className="room">
            {isConnected ? (
                <>
                <Navbar 
                    hasStreamPopup={hasStreamPopup}
                    setHasStreamPopup={setHasStreamPopup}
                />
                {hasStreamPopup && (
                    <MovableStream 
                        user={user}
                        stream={selfStream}
                        hasCamera={hasCamera}
                        isMuted={isMuted}
                        onMinimize={setHasStreamPopup}
                    />
                )}
                <RoomView 
                    isCurrentlyRecording={isCurrentlyRecording}
                />
                </>
            ) : (
                <WaitingRoom />
            )}
        </div>
    )
}