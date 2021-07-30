import { ModalHeader } from "./ModalHeader"
import './Modal.scss';

interface Props {
    header?: string;
    children: any;
    className?: string;
}
export const Modal: React.FC<Props> = ({ children, header, className }) => {
    className = className ? `modal ${className}` : 'modal';
    return(
        <div className={className}>
            {header && <ModalHeader text={header} />}
            {children}
        </div>
    )
}