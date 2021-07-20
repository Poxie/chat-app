import { useEffect, useRef } from "react";
import { Flex } from "../../components/Flex";
import { useRoom } from "../../contexts/RoomProvider"
import { Stream } from "./Stream";

export const RoomStreams = () => {
    let { streams } = useRoom();
    const ref = useRef<null | HTMLDivElement>(null);

    useEffect(() => {
        if(!ref.current) return;
        // if(streams.length === 3 || streams.length === 4) {
        //     ref.current.style.width = `1000px`;
        //     document.documentElement.style.setProperty('--row-items', '2');
        // }
        // if(streams.length < 3) {
        //     document.documentElement.style.setProperty('--row-items', '2');
        //     ref.current.style.width = `100%`;
        // } else if(streams.length >= 5) {
        //     document.documentElement.style.setProperty('--row-items', '3');
        //     ref.current.style.width = `unset`;
        // }
    }, [streams]);

    // let newS: any = [];
    // streams.forEach(stream => newS.push(stream));
    // streams.forEach(stream => newS.push(stream));
    // streams.forEach(stream => newS.push(stream));
    // streams.forEach(stream => newS.push(stream));
    // streams = [...streams, ...newS];

    return(
        <Flex className="streams" flexWrap={'wrap'} justifyContent={'center'}>
            <div className="room-streams" style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center'}} ref={ref}>
                {streams.map((stream, key) => {
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
                            key={Math.random()}
                        />
                    )
                })}
            </div>
        </Flex>
    )
}