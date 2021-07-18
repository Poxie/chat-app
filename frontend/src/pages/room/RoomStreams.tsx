import { Flex } from "../../components/Flex";
import { useRoom } from "../../contexts/RoomProvider"
import { Stream } from "./Stream";

export const RoomStreams = () => {
    const { streams } = useRoom();

    return(
        <Flex className="room-streams" flexWrap={'wrap'}>
            {streams.map((stream, key) => {
                return(
                    <Stream 
                        stream={stream.stream}
                        user={stream.user}
                        key={key}
                    />
                )
            })}
        </Flex>
    )
}