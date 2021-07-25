import { useEffect, useMemo, useRef, useState } from "react";

interface Props {
    spaceFromEdge: number;
    dontAllowMoveWithinTheseBorders?: {left: number, top: number};
    shouldSnap?: boolean;
    isContainedWithinWindow?: boolean;
    children: any;
}
export const MovableElement: React.FC<Props> = ({ spaceFromEdge, dontAllowMoveWithinTheseBorders, shouldSnap, isContainedWithinWindow=true, children }) => {
    const ref = useRef<null | HTMLDivElement>(null);
    const [left, setLeft] = useState(spaceFromEdge);
    const [top, setTop] = useState<number | 'unset'>('unset');

    useEffect(() => {
        document.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('resize', handleMouseUp);
        
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('resize', handleMouseUp);
        };
    }, []);

    const handleMouseDown = useMemo(() => (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if(!ref.current) return;
        const { left: leftElement, top: topElement } = ref.current.getBoundingClientRect();
        const left = e.pageX - leftElement;
        const top = e.pageY - topElement;

        if(dontAllowMoveWithinTheseBorders) {
            const { top: noAllowTop, left: noAllowLeft } = dontAllowMoveWithinTheseBorders;
            if(left <= noAllowLeft && top <= noAllowTop) return;
        }
        document.addEventListener('mousemove', handleMouseMove);
        ref.current.style.transition = 'none';
    }, []);
    const handleMouseUp = useMemo(() => () => {
        document.removeEventListener('mousemove', handleMouseMove);
        if(!ref.current || !shouldSnap) return;
        const style = ref.current.style;
        style.transition = 'left .3s, top .3s';
        const { left, top, height: elementHeight, width: elementWidth } = ref.current.getBoundingClientRect();

        const width = window.innerWidth - elementWidth;
        const height = window.innerHeight - elementHeight;
        if(left < width / 2) {
            setLeft(spaceFromEdge);
        } else {
            setLeft(width - spaceFromEdge);
        }
        if(top < height / 2) {
            setTop(spaceFromEdge);
        } else {
            setTop(height - spaceFromEdge);
        }
    }, []);
    const handleMouseMove = (e: MouseEvent) => {
        if(!ref.current) return;

        const { width, height, left: elementLeft } = ref.current.getBoundingClientRect();
        const containerHeight = window.innerHeight - height - spaceFromEdge;
        const containerWidth = window.innerWidth - width - spaceFromEdge;
        let left = e.pageX - width / 2;
        let top = e.pageY - height / 2;
        if(isContainedWithinWindow) {
            if(left < spaceFromEdge) left = spaceFromEdge;
            if(top < spaceFromEdge) top = spaceFromEdge;
            if(top > containerHeight) top = containerHeight;
            if(left > containerWidth) left = containerWidth;
        }
        setLeft(left);
        setTop(top);
    };
    
    return(
        <div 
            className="movable-stream" 
            style={{left, top, bottom: spaceFromEdge}} 
            onMouseDown={handleMouseDown}
            ref={ref}
        >
            {children}
        </div>
    )
}