import { useRoom } from "../../contexts/RoomProvider";
import { Navbar } from "./Navbar"
import './Room.scss';
import { RoomView } from "./RoomView";
import { WaitingRoom } from "./WaitingRoom";

export const Room = () => {
    const { isConnected } = useRoom();

    return(
        <div className="room">
            {isConnected ? (
                <>
                <Navbar />
                <RoomView />
                </>
            ) : (
                <WaitingRoom />
            )}
        </div>
    )
}