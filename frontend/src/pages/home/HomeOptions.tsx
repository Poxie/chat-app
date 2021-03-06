import { Button } from "../../components/Button"
import { Flex } from "../../components/Flex"
import { CreateMeeting } from "./CreateMeeting"
import { JoinMeeting } from "./JoinMeeting"

export const HomeOptions = () => {
    return(
        <Flex className="home-options">
            <CreateMeeting />
            <JoinMeeting />
        </Flex>
    )
}