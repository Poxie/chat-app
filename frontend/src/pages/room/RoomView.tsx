import { Flex } from "../../components/Flex"
import { User } from "../../types/User"
import { Controls } from "./Controls"
import { IsRecordingNotice } from "./IsRecordingNotice"
import { MovableStream } from "./MovableStream"
import { RoomStreams } from "./RoomStreams"
import { Sidebar } from "./Sidebar"

interface Props {
    isCurrentlyRecording: false | User;
}
export const RoomView: React.FC<Props> = ({ isCurrentlyRecording }) => {
    return(
        <div className="room-view">
            {isCurrentlyRecording && (
                <IsRecordingNotice 
                    user={isCurrentlyRecording}
                />
            )}
            <Sidebar />
            <RoomStreams />
            <Controls />
        </div>
    )
}