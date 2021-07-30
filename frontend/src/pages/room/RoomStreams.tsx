import { useRef } from "react";
import { Flex } from "../../components/Flex";
import { useRoom } from "../../contexts/RoomProvider"
import { Stream } from "./Stream";

export const RoomStreams = () => {
    let { streams } = useRoom();
    const ref = useRef<null | HTMLDivElement>(null);

    const pinnedStream = streams.filter(stream => stream.isPinned)[0];
    const pinnedStreamIndex = streams.indexOf(pinnedStream);
    const notPinnedStreams = streams.filter(stream => !stream.isPinned);
    return(
        <Flex className="streams" flexWrap={'wrap'} justifyContent={'center'}>
            <div className="room-streams" style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center'}} ref={ref}>
                {streams.map((stream, key) => {
                    const notPinnedIndex = notPinnedStreams.indexOf(stream);
                    return(
                        <Stream 
                            stream={stream.stream}
                            user={stream.user}
                            isMuted={stream.isMuted}
                            hasCamera={stream.hasCamera}
                            disconnected={stream.disconnected}
                            connecting={stream.connecting}
                            streamAmount={streams.length}
                            orderId={key}
                            container={ref}
                            isPinned={stream.isPinned}
                            pinnedStream={pinnedStream}
                            pinnedStreamIsBefore={pinnedStreamIndex < key}
                            notPinnedIndex={notPinnedIndex}
                            selfMuted={stream.selfMuted}
                            isPresentation={stream.isPresentation}
                            key={stream?.stream?.id || stream.user.id}
                        />
                    )
                })}
            </div>
        </Flex>
    )
}