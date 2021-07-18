import { Controls } from "./Controls"
import { RoomStreams } from "./RoomStreams"

export const RoomView = () => {
    return(
        <div className="room-view">
            <RoomStreams />
            <Controls />
        </div>
    )
}