import { useChat } from "../../contexts/ChatProvider"
import { Chat } from "./Chat";

export const Sidebar = () => {
    const { open, messages, sendMessage } = useChat();

    return(
        <div className={`sidebar${open ? ' open' : ''}`}>
            <Chat 
                messages={messages}
                sendMessage={sendMessage}
            />
        </div>
    )
}