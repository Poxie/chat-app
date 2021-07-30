import { useEffect, useRef, useState } from "react";
import { Flex } from "../../components/Flex";
import { useAuthentication } from "../../contexts/AuthenticationProvider";
import { useRoom } from "../../contexts/RoomProvider";
import { MinimizeIcon } from "../../icons/MinimizeIcon";
import { Stream } from "./Stream";

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

interface Props {
    hasStreamPopup: boolean;
    setHasStreamPopup: (state: boolean) => void;
}
export const Navbar: React.FC<Props> = ({ hasStreamPopup, setHasStreamPopup }) => {
    const { selfStream, roomId, hasCamera, isMuted } = useRoom();
    const { user } = useAuthentication();
    const [time, setTime] = useState(getReadableTime());
    const currentTime = useRef(getReadableTime());

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
        <Flex className="navbar" alignItems={'center'} justifyContent={'space-between'}>
            <Flex className="navbar-left" alignItems={'center'}>
                <span>{roomId}</span>
            </Flex>
            <Flex className="navbar-right" alignItems={'center'}>
                <div className="time">
                    <span>
                        {getReadableTime()}
                    </span>
                </div>
                {selfStream && !hasStreamPopup && (
                    <div className="self-video">
                        <Stream 
                            hasCamera={hasCamera}
                            isMuted={isMuted}
                            stream={selfStream}
                            user={{username: user.username, id: JSON.stringify(Math.random())}}
                            isSelfStream={true}
                        />
                        <MinimizeIcon 
                            isMinimized={true}
                            onClick={() => setHasStreamPopup(true)}
                            tooltip={'Pop Out'}
                            tooltipDirection={'down'}
                        />
                    </div>
                )}
            </Flex>
        </Flex>
    )
}