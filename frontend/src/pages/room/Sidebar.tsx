import { useEffect, useRef, useState } from "react";
import { Flex } from "../../components/Flex";
import { useRoom } from "../../contexts/RoomProvider";

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const fetchReadableDay = (day: number) => {
    return days[day];
}
const getReadableTime = () => {
    const date = new Date();
    var hours = date.getHours();
    var minutes: string | number = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? `0${minutes}` : minutes;

    const day = fetchReadableDay(date.getDay());
    var strTime = `${day}, ${hours}:${minutes} ${ampm}`;
    return strTime;
}

export const Sidebar = () => {
    const { selfStream } = useRoom();
    const stream = useRef<null | HTMLVideoElement>(null);
    const [time, setTime] = useState(getReadableTime());
    const currentTime = useRef(getReadableTime());

    useEffect(() => {
        if(!stream.current) return;
        stream.current.srcObject = selfStream;
        stream.current.addEventListener('loadedmetadata', () => {
            stream.current?.play();
        })
    }, [selfStream]);

    useEffect(() => {
        const interval = setInterval(() => {
            const time = getReadableTime();
            if(currentTime.current !== time) {
                setTime(time);
                currentTime.current = time;
            }
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const date = new Date();
    return(
        <Flex className="sidebar" alignItems={'center'}>
            <Flex className="sidebar-main" alignItems={'center'}>
                <div className="time">
                    <span>
                        {getReadableTime()}
                    </span>
                </div>
                <div className="self-video">
                    <video muted src={undefined} ref={stream}></video>
                </div>
            </Flex>
        </Flex>
    )
}