import { useEffect, useRef } from "react"
import { Message as MessageType } from "../../types/Message"
import { Message } from "./Message"

interface Props {
    messages: MessageType[];
}
export const Messages: React.FC<Props> = ({ messages }) => {
    const ref = useRef<HTMLDivElement | null>(null);
    const container = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        ref.current?.scrollTo({top: container.current?.offsetHeight});
    }, [messages]);

    return(
        <div className="messages" ref={ref}>
            <div className="message-container" ref={container}>
                <span className="notice">
                    Messages are not saved. If you leave the meeting, the messages will disappear.
                </span>
                {messages.map((message, key) => {
                    return(
                        <Message
                            key={key}
                            author={message.author}
                            content={message.content}
                            date={message.date}
                            hasAuthor={messages[key - 1]?.author.id !== message.author.id}
                        />
                    )
                })}
            </div>
        </div>
    )
}