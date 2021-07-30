interface Props {
    children: any;
}
export const ModalContent: React.FC<Props> = ({ children }) => {
    return(
        <div className="modal-content">
            {children}
        </div>
    )
}