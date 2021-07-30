import { Clickable } from "../components/Clickable"
import { Tooltip } from "../components/Tooltip"

interface Props {
    isMinimized: boolean;
    onClick: () => void;
    tooltip: string;
    tooltipDirection?: 'up' | 'down';
}
export const MinimizeIcon: React.FC<Props> = ({ isMinimized, onClick, tooltip, tooltipDirection="up" }) => {
    return(
        <Tooltip
            tooltip={tooltip}
            direction={tooltipDirection}
            className="minimize-icon"
        >
            <Clickable 
                onClick={onClick}    
            >
                {isMinimized ? (
                    <svg aria-hidden="false" width="24" height="24" viewBox="0 0 24 24"><path d="M19,3H14V5h5v5h2V5A2,2,0,0,0,19,3Z"></path><path d="M19,19H14v2h5a2,2,0,0,0,2-2V14H19Z"></path><path d="M3,5v5H5V5h5V3H5A2,2,0,0,0,3,5Z"></path><path d="M5,14H3v5a2,2,0,0,0,2,2h5V19H5Z"></path></svg>
                    ) : (
                    <svg aria-hidden="false" width="24" height="24" viewBox="0 0 24 24"><path d="M16,8V3H14V8a2,2,0,0,0,2,2h5V8Z"></path><path d="M14,16v5h2V16h5V14H16A2,2,0,0,0,14,16Z"></path><path d="M8,8H3v2H8a2,2,0,0,0,2-2V3H8Z"></path><path d="M8,14H3v2H8v5h2V16A2,2,0,0,0,8,14Z"></path></svg>
                )}
            </Clickable>
        </Tooltip>
    )
}