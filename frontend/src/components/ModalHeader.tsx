interface Props {
    text: string;
    description?: string;
}
export const ModalHeader: React.FC<Props> = ({ text, description }) => {
    return(
        <div className="modal-header">
            <div className="title">
                {text}
            </div>
            {description && (
                <span className="description">
                    {description}
                </span>
            )}
        </div>
    )
}