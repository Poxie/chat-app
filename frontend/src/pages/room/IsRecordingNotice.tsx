import { useEffect, useRef, useState } from "react"
import { Flex } from "../../components/Flex";
import { User } from "../../types/User";
const sound = require('../../sounds/record-countdown.mp3');

interface Props {
    user: User;
}
export const IsRecordingNotice: React.FC<Props> = ({ user }) => {
    const [countDown, setCountDown] = useState(5);
    const audio = useRef<null | HTMLAudioElement>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            setCountDown(previous => {
                if(previous - 1 <= 0) {
                    // clearInterval(interval);
                    return 0;
                };
                audio.current?.play();
                return previous - 1;
            })
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return(
        <Flex className={`recording-notice${countDown === 0 ? ' recording' : ''}`} flexDirection={'column'}>
            <Flex className="recording-notice-container" flexDirection={'column'} alignItems={'center'}>
                <Flex className="recording-countdown" key={countDown} justifyContent={'center'} alignItems={'center'}>
                    {countDown !== 0 ? countDown : 'RECORDING MEETING'}
                </Flex>
                <span className="user-recording">
                    {user.username} is starting to record...
                </span>
                <audio 
                    src={sound.default}
                    ref={audio}
                />
            </Flex>
        </Flex>
    )
}