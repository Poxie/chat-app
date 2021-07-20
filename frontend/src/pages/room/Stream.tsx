import { memo, useEffect, useMemo, useRef, useState } from "react"
import { Flex } from "../../components/Flex";
import { User } from "../../types/User";
import { IsMutedIcon } from "./IsMutedIcon";
import { LetterIcon } from "./LetterIcon";
import { useRoom } from "../../contexts/RoomProvider";
import { StreamVideo } from "./StreamVideo";

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
export const Stream: React.FC<Props> = memo(({ stream, user, hasCamera, isMuted, disconnected, connecting, orderId, container: streamContainer, isSelfStream=false, streamAmount }) => {
    const { removeStream, setConnected } = useRoom();
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
        if(width * RATIO * amountOfRows > containerHeight) {
            return checkIfWidthExceeds(width - 1, containerHeight, amountOfRows);
        }
        return width;
    }
    const determineWidth = (isEven: boolean, availableWidth: number, rowAmount: number, amountOfRows: number, containerHeight: number) => {
        let width = isEven ? (availableWidth / rowAmount) : (availableWidth / rowAmount);
        return checkIfWidthExceeds(width, containerHeight, amountOfRows);
    }
    const getRowItemLength = useMemo(() => (rowAmount: number, currentRow: number, streamAmount: number) => {
        const rows = chunkArray(streamAmount, rowAmount);
        // @ts-ignore
        let itemLength = rows[currentRow]?.length;
        return [itemLength, rows];
    }, []);
    const determineLeft = (width: number, containerWidth: number, rowIndex: number, orderId: number, rowAmount: number, currentRow: number) => {
        if(!streamAmount) return;
        let left;
        if(orderId + 1 === streamAmount && rowIndex === 1) {
            left = containerWidth / 2 - width / 2 - SPACING;
        } else {
            rowIndex--;
            const [rowItemLength, rows] = getRowItemLength(rowAmount, currentRow, streamAmount);
            console.log(rowItemLength)
            left = (rowAmount * width) / (rowItemLength / (rowItemLength - 1)) - (rowIndex * width) - (SPACING * 2 * (rowIndex)) + ((containerWidth - width * rowAmount) / 2) + SPACING * (rowItemLength - 1) - SPACING;
        }
        return left;
    }
    const resizeStreams = () => {
        if(!streamAmount || !streamContainer.current || !container.current || orderId === undefined) return;
        // Calculating the amount of streams per row
        const isEven = streamAmount % 2 === 0;
        let rowAmount;
        if(streamAmount / 2 === 1) {
            rowAmount = 2;
        } else {
            rowAmount = Math.floor(streamAmount/5) * 1 + 2;
        }
        const amountOfRows = Math.round(streamAmount / rowAmount);

        const containerWidth = streamContainer.current.offsetWidth;
        const containerHeight = streamContainer.current.offsetHeight - ((SPACING * 2) * amountOfRows);
        const availableWidth = containerWidth - (streamAmount * SPACING + SPACING * 6);

        const style = container.current.style;
        // Setting width of stream
        const width = determineWidth(isEven, availableWidth, rowAmount, amountOfRows, containerHeight);
        style.width = `${width}px`;
        const currentRow = amountOfRows === 1 ? 0 : Math.floor((orderId / rowAmount));
        console.log(amountOfRows, currentRow, rowAmount);
        const rowIndex = currentRow !== 0 ? orderId - (rowAmount * currentRow - 1) : orderId + 1;
        // Setting position of element
        const left = determineLeft(width, containerWidth, rowIndex, orderId, rowAmount, currentRow);
        style.left = `${left}px`;
        let topCurrentRow = amountOfRows === 1 ? 0 : Math.floor(orderId / rowAmount)
        let top = width * RATIO * topCurrentRow + SPACING * topCurrentRow * 2;
        style.top = `${top}px`;
    }
    useEffect(() => {
        window.addEventListener('resize', resizeStreams);
        return () => window.removeEventListener('resize', resizeStreams);
    }, [streamAmount]);
    useEffect(resizeStreams, [streamAmount, orderId]);

    return(
        <div data-order={orderId} className={`user${isSpeaking ? ' is-speaking' : ''}${disconnected ? ' disconnected' : ''}${connecting ? ' connecting' : ''}`} ref={container}>
            {!isSelfStream && (
                <div className="user-top">
                    {isMuted && <IsMutedIcon />}
                </div>
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