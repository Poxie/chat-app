import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Clickable } from "../components/Clickable";
import { Message } from "../pages/room/Message";
import { ChatContext as ChatContextType } from "../types/ChatContext";
import { ChatNotification } from "../types/ChatNotification";
import { Message as MessageType } from "../types/Message";
import { useAuthentication } from "./AuthenticationProvider";
import { useRoom } from "./RoomProvider";
import { useSidebar } from "./SidebarProvider";

const ChatContext = createContext<ChatContextType>({messages: [], sendMessage: () => {}, unread: 0});

export const useChat = () => {
    return useContext(ChatContext);
}

interface Props {
    children: any;
}
export const ChatProvider: React.FC<Props> = ({ children }) => {
    const { socket, roomId } = useRoom();
    const { open, type, toggleSidebar } = useSidebar();
    const isOpen = useRef(open);
    const { user } = useAuthentication();
    const [messages, setMessages] = useState<MessageType[]>([]);
    const [unread, setUnread] = useState<number>(0);
    const [notifications, setNotification] = useState<ChatNotification[]>([]);

    useEffect(() => {
        isOpen.current = open && type === 'chat';
        if(isOpen.current) {
            setUnread(0);
            closeNotifications();
        };
    }, [open, type]);

    const sendMessage = useMemo(() => (value: string) => {
        socket.emit('send-message', ({ roomId, content: value, author: {username: user.username, id: socket.id}}));
    }, []);

    useEffect(() => {
        socket.on('send-message', ({ content, author, date }: MessageType) => {
            const message = {content, author, date, animateIn: false, animateOut: false};
            setMessages(previous => [...previous, ...[message]]);
            if(!isOpen.current) {
                setUnread(previous => previous + 1);
                setNotification(previous => [...previous, ...[message]]);
            }
        })

        return () => {
            socket.off('send-message');
            setMessages([]);
            setUnread(0);
            setNotification([]);
        }
    }, []);
    useEffect(() => {
        setTimeout(() => {
            setNotification(previous => {
                const newNotifications = previous.map((notif, key) => {
                    if(!notif.animateIn) {
                        notif.animateIn = true
                        setTimeout(() => {
                            removeNotification(notif);
                        }, 6000);
                    };
                    return notif;
                })
                return newNotifications
            })
        }, 100);
    }, [notifications.length]);
    const removeNotification = useMemo(() => (notification: ChatNotification) => {
        setNotification(previous => previous.map(notif => {
            if(notif === notification) notif.animateOut = true;
            return notif;
        }))
        setTimeout(() => {
            setNotification(previous => previous.filter(prev => prev !== notification));
        }, 300);
    }, []);
    const closeNotifications = useMemo(() => () => {
        setNotification([]);
        toggleSidebar(true, 'chat');
        isOpen.current = true;
    }, []);

    const value = {
        messages,
        sendMessage,
        unread
    }

    return(
        <ChatContext.Provider value={value}>
            {children}
            <div className="chat-notifications">
                {notifications.map(notification => {
                    let className = 'notification ';
                    className += notification.animateIn ? 'animate-in' : '';
                    className += notification.animateOut ? 'animate-in animate-out' : '';
                    return(
                        <Clickable className={className} onClick={closeNotifications} key={notification.date}>
                            <Message 
                                author={notification.author}
                                content={notification.content}
                                date={notification.date}
                                hasAuthor={true}
                            />
                        </Clickable>
                    )
                })}
            </div>
        </ChatContext.Provider>
    )
}