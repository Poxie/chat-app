import { useEffect, useMemo, useRef, useState } from "react";
import { MovableElement } from "../../components/MovableElement";
import { ContextUser } from "../../types/AuthenticationContext";
import { MinimizeIcon } from "./MinimizeIcon";
import { Stream } from "./Stream";

interface Props {
    user: ContextUser;
    stream: MediaStream | null;
    hasCamera: boolean;
    isMuted: boolean;
    onMinimize: (state: boolean) => void;
}

const SPACE_FROM_EDGE = 25;
export const MovableStream: React.FC<Props> = ({ user, stream, hasCamera, isMuted, onMinimize }) => {
    const [top, setTop] = useState(100);

    if(!stream) return <div></div>
    let selfUser = {...user, ...{
        id: 'self-user'
    }};

    const getTooltipDirection = () => {
        if(top < 50) return 'down';
        return 'up';
    }

    const handlePositionChange = (top: number | 'unset', left: number) => {
        if(top === 'unset') return;
        setTop(top);
    }
    
    return(
        <MovableElement
            spaceFromEdge={25}
            dontAllowMoveWithinTheseBorders={{top: 43, left: 43}}
            shouldSnap={true}
            height={161}
            className={'movable-stream'}
            onChange={handlePositionChange}
        >
            <MinimizeIcon 
                isMinimized={false} 
                tooltip={'Minimize'}
                onClick={() => onMinimize(false)}
                tooltipDirection={getTooltipDirection()}
            />
            <Stream 
                hasCamera={hasCamera}
                isMuted={isMuted}
                stream={stream}
                user={selfUser}
                isSelfStream={true}
            />
        </MovableElement>
    )
}