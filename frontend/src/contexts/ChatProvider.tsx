import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ChatContext as ChatContextType } from "../types/ChatContext";
import { Message } from "../types/Message";
import { useAuthentication } from "./AuthenticationProvider";
import { useRoom } from "./RoomProvider";

const ChatContext = createContext<ChatContextType>({setOpen: (state: boolean) => {}, messages: [], open: false, sendMessage: () => {}, unread: 0});

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
    const [unread, setUnread] = useState<number>(0);
    const [open, setOpen] = useState(false);
    const isOpen = useRef(false);

    const sendMessage = useMemo(() => (value: string) => {
        socket.emit('send-message', ({ roomId, content: value, author: {username: user.username, id: socket.id}}));
    }, []);

    useEffect(() => {
        socket.on('send-message', ({ content, author, date }: Message) => {
            const message = {content, author, date};
            setMessages(previous => [...previous, ...[message]]);
            if(!isOpen.current) {
                setUnread(previous => previous + 1);
            }
        })

        return () => socket.off('send-message');
    }, []);

    const handleSetOpen = useMemo(() => (state: boolean) => {
        setOpen(state);
        isOpen.current = state;
        if(state) {
            setUnread(0);
        }
    }, [setOpen, isOpen.current]);

    const value = {
        messages,
        setOpen: handleSetOpen,
        open,
        sendMessage,
        unread
    }

    return(
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    )
}