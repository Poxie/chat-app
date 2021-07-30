import { Button } from "../../components/Button"
import { Flex } from "../../components/Flex"
import { LoadingIcon } from "../../components/LoadingIcon";

interface Props {
    joinRoom: () => void;
    members: number | null;
    stream: MediaStream | null;
}

export const WaitingHeader: React.FC<Props> = ({ joinRoom, members, stream }) => {
    if(!stream) {
        return(
            <Flex className="header loading" flexDirection={'column'} alignItems={'center'}>
                <span>
                    Preparing...
                </span>
                <span className="silent">
                    Waiting for microphone and camera access
                </span>
                <LoadingIcon />
            </Flex>
        )
    }

    const singular = members === 1;
    return(
        <Flex className="header" flexDirection={'column'} alignItems={'center'}>
            <span>
                Ready to join the meeting?
            </span>
            {members !== null && (
                <span className="silent">
                    There {singular ? 'is' : 'are'} {members} {singular ? 'member' : 'members'} in this meeting
                </span>
            )}
            <Button rounded={true} onClick={joinRoom}>
                Join meeting
            </Button>
        </Flex>
    )
}