import { Flex } from "../../components/Flex"
import { Controls } from "./Controls"
import { RoomStreams } from "./RoomStreams"
import { Sidebar } from "./Sidebar"

export const RoomView = () => {
    return(
        <div className="room-view">
            <Sidebar />
            <RoomStreams />
            <Controls />
        </div>
    )
}