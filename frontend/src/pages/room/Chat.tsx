import { Flex } from "../../components/Flex"
import { Input } from "../../components/Input"
import { Message } from "../../types/Message"
import { Messages } from "./Messages"

interface Props {
    sendMessage: (content: string) => void;
    messages: Message[];
}
export const Chat: React.FC<Props> = ({ messages, sendMessage }) => {
    return(
        <Flex className="chat" flexDirection={'column'}>
            <div className="header">
                <span>
                    Chat messages
                </span>
            </div>
            <Messages 
                messages={messages}
            />
            <Input 
                placeholder={'Send a message...'}
                onSubmit={sendMessage}
            />
        </Flex>
    )
}