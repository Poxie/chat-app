import { Sidebar } from "./Sidebar"
import './Room.scss';
import { RoomView } from "./RoomView";

export const Room = () => {
    return(
        <div className="room">
            <RoomView />
            <Sidebar />
        </div>
    )
}