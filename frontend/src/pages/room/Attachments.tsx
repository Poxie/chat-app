import { Flex } from "../../components/Flex"
import { Attachment as AttachmentType } from "../../types/Attachment"
import { Attachment } from "./Attachment"

interface Props {
    attachments: AttachmentType[];
}
export const Attachments: React.FC<Props> = ({ attachments }) => {
    return(
        <Flex className="attachments" flexDirection={'column'}>
            <div className="header">
                <span>
                    Attachments
                </span>
            </div>
            <span className="notice">
                Attachments are not saved. If you leave the meeting the attachments will disappear. You may download them before leaving.
            </span>
            <div className="attachment-container">
                {attachments.map(attachment => {
                    return(
                        <Attachment 
                            id={attachment.id}
                            name={attachment.name}
                            source={attachment.source}
                            type={attachment.type}
                            isDownloadable={attachment.isDownloadable}
                        />
                    )
                })}
            </div>
        </Flex>
    )
}