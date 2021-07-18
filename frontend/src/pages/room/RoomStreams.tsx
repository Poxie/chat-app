import { useEffect } from "react";
import { Flex } from "../../components/Flex";
import { useRoom } from "../../contexts/RoomProvider"
import { Stream } from "./Stream";

export const RoomStreams = () => {
    const { streams } = useRoom();
    
    useEffect(() => {
        console.log(streams);
    }, [streams]);

    return(
        <Flex className="room-streams" flexWrap={'wrap'} justifyContent={'center'}>
            {streams.map((stream, key) => {
                return(
                    <Stream 
                        stream={stream.stream}
                        user={stream.user}
                        isMuted={stream.isMuted}
                        hasCamera={stream.hasCamera}
                        disconnected={stream.disconnected}
                        key={stream.stream.id}
                    />
                )
            })}
        </Flex>
    )
}