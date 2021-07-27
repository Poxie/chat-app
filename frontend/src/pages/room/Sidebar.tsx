import { useChat } from "../../contexts/ChatProvider"
import { useSidebar } from "../../contexts/SidebarProvider";
import { Chat } from "./Chat";

export const Sidebar = () => {
    const { open, type } = useSidebar();
    const { messages, sendMessage } = useChat();

    let component;
    switch(type) {
        case 'chat':
            component = (
                <Chat 
                    messages={messages}
                    sendMessage={sendMessage}
                />
            )
    }

    return(
        <div className={`sidebar${open ? ' open' : ''}`}>
            {component}
        </div>
    )
}