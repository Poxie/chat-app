interface Props {
    text: string;
    description?: string;
    children?: any;
}
export const ModalHeader: React.FC<Props> = ({ text, description, children }) => {
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
            {children}
        </div>
    )
}