interface Props {
    date: number;
}

export const Timestamp: React.FC<Props> = ({ date: timestamp }) => {
    var date = new Date(timestamp);

    var hours = date.getHours();
    var minutes: number | string = date.getMinutes();

    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = `${hours}:${minutes} ${ampm}`;
    return(
        <div className="timestamp">
            {strTime}
        </div>
    )
}