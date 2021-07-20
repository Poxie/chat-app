import './Button.css';
import { Clickable } from './Clickable';

interface Props {
    children: any;
    type?: 'primary' | 'secondary';
    style?: any;
    rounded?: boolean;
    onClick?: () => void;
}

export const Button: React.FC<Props> = ({ children, type='primary', style, rounded, onClick }) => {
    const className = `button ${type}${rounded ? ' rounded' : ''}`;
    return(
        <Clickable onClick={onClick} className={className}>
            <div className={`button-content`} style={style}>
                {children}
            </div>
        </Clickable>
    )
}