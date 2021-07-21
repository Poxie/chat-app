import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ChatContext as ChatContextType } from "../types/ChatContext";
import { Message } from "../types/Message";
import { useAuthentication } from "./AuthenticationProvider";
import { useRoom } from "./RoomProvider";

const ChatContext = createContext<ChatContextType>({setOpen: (state: boolean) => {}, messages: [], open: false, sendMessage: () => {}});

export const useChat = () => {
    return useContext(ChatContext);
}

interface Props {
    children: any;
}
export const ChatProvider: React.FC<Props> = ({ children }) => {
    const { socket, roomId } = useRoom();
    const { user } = useAuthentication();
    const [messages, setMessages] = useState<Message[]>([]);
    const [open, setOpen] = useState(false);

    const sendMessage = useMemo(() => (value: string) => {
        socket.emit('send-message', ({ roomId, content: value, author: {username: user.username, id: socket.id}}));
    }, []);

    useEffect(() => {
        socket.on('send-message', ({ content, author, date }: Message) => {
            const message = {content, author, date};
            setMessages(previous => [...previous, ...[message]]);
        })
    }, []);

    const value = {
        messages,
        setOpen,
        open,
        sendMessage
    }

    return(
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    )
}