import { Flex } from "../../components/Flex"
import { LetterIcon } from "../../icons/LetterIcon"
import { User } from "../../types/User"
import { Timestamp } from "./Timestamp"

interface Props {
    content: string;
    author: User;
    date: number;
    hasAuthor: boolean;
}

export const Message: React.FC<Props> = ({ content, author, date, hasAuthor }) => {
    return(
        <div className={`message${hasAuthor ? ' has-author' : ''}`}>
            {hasAuthor && (
                <div className="author-icon">
                    <LetterIcon 
                        username={author.username}
                    />
                </div>
            )}
            <div className="message-main">
                {hasAuthor && (
                    <Flex className="message-top">
                        <div className="author">
                            {author.username}
                        </div>
                        <Timestamp 
                            date={date}
                        />
                    </Flex>
                )}
                <div className="message-content">
                    {content}
                </div>
            </div>
        </div>
    )
}