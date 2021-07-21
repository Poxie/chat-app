import { ModalHeader } from "./ModalHeader"
import './Modal.scss';

interface Props {
    header?: string;
    children: any;
}
export const Modal: React.FC<Props> = ({ children, header}) => {
    return(
        <div className="modal">
            {header && <ModalHeader text={header} />}
            {children}
        </div>
    )
}