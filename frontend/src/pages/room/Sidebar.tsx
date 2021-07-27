import { useAttachments } from "../../contexts/AttachmentProvider";
import { useChat } from "../../contexts/ChatProvider"
import { useSidebar } from "../../contexts/SidebarProvider";
import { Attachments } from "./Attachments";
import { Chat } from "./Chat";

export const Sidebar = () => {
    const { open, type } = useSidebar();
    const { messages, sendMessage } = useChat();
    const { attachments } = useAttachments();

    let component;
    switch(type) {
        case 'chat':
            component = (
                <Chat 
                    messages={messages}
                    sendMessage={sendMessage}
                />
            )
            break;
        case 'attachments':
            component = (
                <Attachments 
                    attachments={attachments}
                />
            )
        
    }

    return(
        <div className={`sidebar${open ? ' open' : ''}`}>
            {component}
        </div>
    )
}