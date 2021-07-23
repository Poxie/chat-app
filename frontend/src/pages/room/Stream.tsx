import { memo, useEffect, useMemo, useRef, useState } from "react"
import { Flex } from "../../components/Flex";
import { User } from "../../types/User";
import { IsMutedIcon } from "./IsMutedIcon";
import { LetterIcon } from "./LetterIcon";
import { useRoom } from "../../contexts/RoomProvider";
import { StreamVideo } from "./StreamVideo";
import { useChat } from "../../contexts/ChatProvider";
import { PinIcon } from "./PinIcon";
import { StreamOptions } from "./StreamOptions";
import { Stream as StreamType } from "../../types/Stream";

interface Props {
    stream: MediaStream;
    user: User;
    isMuted: boolean;
    hasCamera: boolean;
    orderId?: number;
    disconnected?: boolean;
    container?: any;
    isSelfStream?: boolean;
    connecting?: boolean;
    streamAmount?: number;
    isPinned?: boolean;
    pinnedStream?: StreamType;
    pinnedStreamIsBefore?: boolean;
    notPinnedIndex?: number;
}

const chunkArray = (streamAmount: number, rowAmount: number) => {
    var array: any = [];
    for(let i = 0; i < streamAmount; i++) {
        array.push(i);
    }
    return [].concat.apply([],
        array.map(function(elem: any, i: number) {
            return i % rowAmount ? [] : [array.slice(i, i + rowAmount)];
        })
    );
}
const RATIO = 0.7492063492;
const SPACING = 10;
const NON_PINNED_WIDTH = 300;
export const Stream: React.FC<Props> = memo(({ stream, user, hasCamera, isMuted, disconnected, connecting, orderId, container: streamContainer, isSelfStream=false, streamAmount, isPinned, pinnedStream, pinnedStreamIsBefore, notPinnedIndex }) => {
    const { removeStream, setConnected, setPinned } = useRoom();
    const { open } = useChat();
    const container = useRef<HTMLDivElement | null>(null);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const variables = useRef<any>({});

    useEffect(() => {
        if(disconnected === true) {
            setTimeout(() => {
                container.current?.classList.add('shrink');
                removeStream(user.id);
            }, 400);
        }
    }, [disconnected]);

    useEffect(() => {
        if(connecting) {
            setTimeout(() => {
                setConnected(user.id);
            }, 500);
        }
    }, [connecting]);

    // Makes sure height doesn't exceed container
    const checkIfWidthExceeds: any = (width: number, containerHeight: number, amountOfRows: number, isPinned?: boolean) => {
        const condition = isPinned ? width * RATIO - SPACING * 2 > containerHeight : width * RATIO * amountOfRows > containerHeight;
        if(condition) {
            return checkIfWidthExceeds(width - 1, containerHeight, amountOfRows, isPinned);
        }
        return width;
    }

    // Getting the length of a certain row
    const getRowLength = useMemo(() => (rowAmount: number, currentRow: number, streamAmount: number) => {
        const rows = chunkArray(streamAmount, rowAmount);
        // @ts-ignore
        let itemLength = rows[currentRow]?.length;
        return itemLength;
    }, []);

    // Simple function to update stream styles
    const updateStreamStyle = useMemo(() => (property: any, value: any) => {
        if(!container.current) return;
        container.current.style[property] = value;
    }, [container.current]);

    // Getting the available stream container width
    const getAvailableWidth = useMemo(() => (containerWidth: number, pinnedStream?: StreamType, isPinned?: boolean) => {
        if(!streamAmount) return containerWidth;
        const { containerHeight, amountOfRows, rowAmount } = variables.current;
        let availableWidth;
        if(isPinned) {
            availableWidth = containerWidth - NON_PINNED_WIDTH;
        } else {
            if(pinnedStream) {
                const pinnedWidthOrigin: any = getAvailableWidth(containerWidth, pinnedStream, true);
                const pinnedWidth = checkIfWidthExceeds(pinnedWidthOrigin, containerHeight, amountOfRows, true);
                availableWidth = containerWidth - pinnedWidth - SPACING * 8;
            } else {
                availableWidth = containerWidth - (rowAmount * SPACING) - SPACING * amountOfRows - SPACING;
            }
        }
        return availableWidth;
    }, [streamAmount]);

    // Stream width styling
    const setWidth = useMemo(() => () => {
        const { containerWidth, containerHeight, rowAmount, amountOfRows, isPinned, pinnedStream } = variables.current;
        const availableWidth = getAvailableWidth(containerWidth, pinnedStream, isPinned);

        let width;
        if(isPinned) {
            width = availableWidth;
        } else {
            width = availableWidth / rowAmount;
        }
        width += SPACING;
        width = checkIfWidthExceeds(width, containerHeight, amountOfRows, isPinned);
        variables.current = {...variables.current, ...{
            width
        }}
        updateStreamStyle('width', `${width}px`);
    }, [variables]);

    // Stream left styling
    const setLeft = useMemo(() => () => {   
        if(!streamAmount || orderId === undefined) return;
        const { containerWidth, containerHeight, rowIndex, currentRow, rowAmount, width, isPinned, pinnedStream, amountOfRows } = variables.current;
        const availableWidth = getAvailableWidth(containerWidth, pinnedStream, isPinned);
        const rowLength = getRowLength(rowAmount, currentRow, streamAmount);
        
        let left;
        if(orderId + 1 === streamAmount && rowIndex === 0) {
            left = containerWidth / 2 - width / 2;
        } else {
            const emptySpace = availableWidth - (width * rowLength);
            left = width * rowIndex + SPACING * rowIndex + emptySpace / 2 + SPACING * 2;
        }
        if(isPinned) left = 0;
        if(!isPinned && pinnedStream) {
            const pinnedWidthOrigin = getAvailableWidth(containerWidth, pinnedStream, true);
            let pinnedWidth = checkIfWidthExceeds(pinnedWidthOrigin, containerHeight, amountOfRows, true);
            left = pinnedWidth + SPACING;

            // Gives row items more spacing
            left += rowIndex * width;

            // Adding extra spacing between items
            left += SPACING * 2 + SPACING * rowIndex;
        }
        updateStreamStyle('left', `${left}px`);
    }, [streamAmount, orderId]);

    // Stream top styling
    const setTop = useMemo(() => () => {
        if(!streamAmount) return;
        const { currentRow, width, isPinned, pinnedStream, containerHeight, rowAmount } = variables.current;
        let top = isPinned ? 0 : currentRow * width * RATIO + SPACING * currentRow;
        if(!isPinned && pinnedStream) {
            const emptySpace = containerHeight - ((Math.round((streamAmount - 1) / rowAmount)) * width * RATIO);
            top += emptySpace / 2;
        }
        updateStreamStyle('top', `${top}px`);
    }, [streamAmount]);
    
    const resizeStreams = () => {
        if(!streamAmount || !streamContainer.current || !container.current || orderId === undefined) return;
        
        // Calculating the amount of streams per row
        let rowAmount;
        if(streamAmount / 2 === 1) {
            rowAmount = 2;
        } else {
            rowAmount = Math.floor(streamAmount/5) * 1 + 2;
        }
        let amountOfRows = Math.round(streamAmount / rowAmount);
        if(pinnedStream) {
            if(streamAmount - 1 === 2) {
                rowAmount = 1;
            } else {
                rowAmount = Math.floor((streamAmount - 1)/5) * 1 + 2;
            }
            if(!isPinned) {
                rowAmount = 2;
                amountOfRows = Math.floor(streamAmount / 2);
                console.log(amountOfRows);
            }
        };

        // Updating all variables
        const containerWidth = streamContainer.current.offsetWidth;
        const containerHeight = streamContainer.current.offsetHeight - (SPACING * amountOfRows);
        let currentRow = amountOfRows === 1 ? 0 : Math.floor((orderId / rowAmount));
        let rowIndex = currentRow !== 0 ? orderId - (rowAmount * currentRow - 1) : orderId + 1;
        if(!isPinned && notPinnedIndex !== undefined) {
            currentRow = amountOfRows === 1 ? 0 : Math.floor((notPinnedIndex / rowAmount));
            rowIndex = currentRow !== 0 ? notPinnedIndex - (rowAmount * currentRow - 1) : notPinnedIndex + 1;
        }

        // Setting the updated variables
        variables.current = {
            ...variables.current,
            ...{
                rowAmount,
                containerWidth,
                containerHeight,
                amountOfRows,
                rowIndex: rowIndex - 1,
                currentRow,
                isPinned,
                pinnedStream
            }
        }

        // Styling stream
        setWidth();
        setLeft();
        setTop();
    }
    useEffect(() => {
        window.addEventListener('resize', resizeStreams);
        return () => window.removeEventListener('resize', resizeStreams);
    }, [streamAmount, isPinned, pinnedStream, pinnedStreamIsBefore]);
    useEffect(resizeStreams, [streamAmount, orderId, pinnedStream, notPinnedIndex, isPinned]);
    useEffect(() => {
        setTimeout(resizeStreams, 300);
    }, [open]);

    return(
        <div data-order={orderId} className={`user${isSpeaking ? ' is-speaking' : ''}${disconnected ? ' disconnected' : ''}${connecting ? ' connecting' : ''}`} ref={container}>
            {!isSelfStream && (
                <>
                <div className="user-top">
                    {isMuted && <IsMutedIcon />}
                </div>
                {isPinned !== undefined && (
                    <StreamOptions 
                        isPinned={isPinned}
                        setPinned={() => setPinned(isPinned ? null : user.id)}
                    />
                )}
                </>
            )}
            <Flex className="stream" alignItems={'center'}>
                {!hasCamera && (
                    <LetterIcon 
                        username={user.username}
                    />
                )}
                <StreamVideo 
                    setIsSpeaking={setIsSpeaking}
                    stream={stream}
                    isSelfStream={isSelfStream}
                />
            </Flex>
            {!isSelfStream && (
                <div className="username">
                    {user.username}
                </div>
            )}
        </div>
    )
});