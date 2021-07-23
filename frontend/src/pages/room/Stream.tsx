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

    const checkIfWidthExceeds: any = (width: number, containerHeight: number, amountOfRows: number) => {
        const condition = isPinned ? width * RATIO > containerHeight : width * RATIO * amountOfRows > containerHeight;
        if(condition) {
            return checkIfWidthExceeds(width - 1, containerHeight, amountOfRows);
        }
        return width;
    }
    const determineWidth = (availableWidth: number, rowAmount: number, amountOfRows: number, containerHeight: number, isPinned?: boolean) => {
        let width;
        if(isPinned) {
            width = (availableWidth - NON_PINNED_WIDTH) - SPACING * 2;
        } else {
            width = availableWidth / rowAmount;
        }
        return checkIfWidthExceeds(width, containerHeight, amountOfRows);
    }
    const getRowItemLength = useMemo(() => (rowAmount: number, currentRow: number, streamAmount: number) => {
        const rows = chunkArray(streamAmount, rowAmount);
        // @ts-ignore
        let itemLength = rows[currentRow]?.length;
        return [itemLength, rows];
    }, []);
    const determineLeft = (width: number, containerWidth: number, rowIndex: number, orderId: number, rowAmount: number, currentRow: number, availableWidth: number) => {
        if(!streamAmount) return;
        let left;
        if(isPinned) {
            const normalWidth = containerWidth - NON_PINNED_WIDTH;
            return SPACING * 2;
        } else if(pinnedStream && notPinnedIndex !== undefined) {
            const row = Math.floor((notPinnedIndex / rowAmount) + .1);
            currentRow = currentRow !== 0 ? notPinnedIndex - (rowAmount * currentRow - 1) : notPinnedIndex + 1;
            const [ itemLength ] = getRowItemLength(rowAmount, row, streamAmount - 1);
            left = itemLength === 1 ? containerWidth - (availableWidth / 2) - width / 2 : containerWidth - rowIndex * width;
            left -= SPACING * rowIndex + SPACING * 2;
            return left;
            // return (containerWidth - (streamAmount * SPACING + SPACING * 6)) - width + SPACING * 4;
        }
        // if(pinnedStream) return containerWidth - width - SPACING * 3;
        if(orderId + 1 === streamAmount && rowIndex === 1) {
            left = containerWidth / 2 - width / 2 - SPACING;
        } else {
            rowIndex--;
            const [rowItemLength, rows] = getRowItemLength(rowAmount, currentRow, streamAmount);
            left = (rowAmount * width) / (rowItemLength / (rowItemLength - 1)) - (rowIndex * width) - (SPACING * 2 * (rowIndex)) + ((containerWidth - width * rowAmount) / 2) + SPACING * (rowItemLength - 1) - SPACING;
        }
        return left;
    }
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
            // amountOfRows = streamAmount - 1;
        };

        const containerWidth = streamContainer.current.offsetWidth;
        const containerHeight = streamContainer.current.offsetHeight - ((SPACING * 2) * amountOfRows);
        let availableWidth = containerWidth - (streamAmount * SPACING + SPACING * 6);
        if(!isPinned && pinnedStream) availableWidth = availableWidth - determineWidth(availableWidth, 1, 1, containerHeight, true); 

        // Styling stream
        const style = container.current.style;

        // Setting width of stream
        const width = determineWidth(availableWidth, rowAmount, amountOfRows, containerHeight, isPinned);
        style.width = `${width}px`;
        let currentRow = amountOfRows === 1 ? 0 : Math.floor((orderId / rowAmount));
        let rowIndex = currentRow !== 0 ? orderId - (rowAmount * currentRow - 1) : orderId + 1;
        if(!isPinned && notPinnedIndex !== undefined) {
            currentRow = amountOfRows === 1 ? 0 : Math.floor((notPinnedIndex / rowAmount));
            rowIndex = currentRow !== 0 ? notPinnedIndex - (rowAmount * currentRow - 1) : notPinnedIndex + 1;
        }

        // Setting position of element
        const left = determineLeft(width, containerWidth, rowIndex, orderId, rowAmount, currentRow, availableWidth);
        style.left = `${left}px`;
        let topCurrentRow = amountOfRows === 1 ? 0 : Math.floor(orderId / rowAmount)
        let top = isPinned ? 0 : width * RATIO * topCurrentRow + SPACING * topCurrentRow * 2;
        if(!isPinned && pinnedStream && notPinnedIndex !== undefined) {
            const row = Math.floor(notPinnedIndex / rowAmount);
            top = row * width * RATIO + SPACING * row;
        }
        style.top = `${top}px`;
    }
    useEffect(() => {
        window.addEventListener('resize', resizeStreams);
        return () => window.removeEventListener('resize', resizeStreams);
    }, [streamAmount, isPinned, pinnedStream, pinnedStreamIsBefore]);
    useEffect(resizeStreams, [streamAmount, orderId, pinnedStream, notPinnedIndex]);
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