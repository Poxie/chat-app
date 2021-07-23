interface Props {
    amount: number;
}

export const UnreadMarker: React.FC<Props> = ({ amount }) => {
    return(
        <div className="unread-marker">
            {amount}
        </div>
    ) 
}