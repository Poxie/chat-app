import { Flex } from "../../components/Flex"
import { PinIcon } from "./PinIcon"
import { SpeakerIcon } from "./SpeakerIcon"

interface Props {
    isPinned: boolean;
    setPinned: () => void;
    isSelfMuted?: boolean;
    setSelfMuted: () => void;
}
export const StreamOptions: React.FC<Props> = ({ isPinned, setPinned, isSelfMuted, setSelfMuted }) => {
    return(
        <Flex className="stream-options" alignItems={'center'}>
            <PinIcon 
                active={isPinned}
                onClick={setPinned}
            />
            <SpeakerIcon 
                active={!isSelfMuted}
                onClick={setSelfMuted}
            />
        </Flex>
    )
}