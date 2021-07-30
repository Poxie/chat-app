import { Flex } from "../../components/Flex"
import { PinIcon } from "../../icons/PinIcon"
import { SpeakerIcon } from "../../icons/SpeakerIcon"

interface Props {
    isPinned: boolean;
    setPinned: () => void;
    isSelfMuted?: boolean;
    setSelfMuted: () => void;
    streamAmount: number | undefined;
}
export const StreamOptions: React.FC<Props> = ({ isPinned, setPinned, isSelfMuted, setSelfMuted, streamAmount }) => {
    return(
        <Flex className="stream-options" alignItems={'center'}>
            <div className={streamAmount === 1 ? 'disabled' : ''}>
                <PinIcon 
                    active={isPinned}
                    onClick={setPinned}
                />
            </div>
            <SpeakerIcon 
                active={!isSelfMuted}
                onClick={setSelfMuted}
            />
        </Flex>
    )
}