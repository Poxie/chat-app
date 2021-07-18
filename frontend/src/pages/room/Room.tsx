import { Navbar } from "./Navbar"
import './Room.scss';
import { RoomView } from "./RoomView";

export const Room = () => {
    return(
        <div className="room">
            <Navbar />
            <RoomView />
        </div>
    )
}