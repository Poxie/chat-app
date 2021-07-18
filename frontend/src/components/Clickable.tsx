interface Props {
    children: any;
    className?: string;
    id?: string;
    onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

export const Clickable: React.FC<Props> = ({ children, className, id, onClick }) => {
    className = className ? `${className} clickable` : 'clickable';
    return(
        <div className={className} style={{cursor: 'pointer'}} onClick={onClick} id={id}>
            {children}
        </div>
    )
}