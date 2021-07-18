import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

const FeedbackContext = createContext<any>(null);

export const useFeedback = () => {
    return useContext(FeedbackContext);
}

interface Props {
    children: any;
}
export const FeedbackProvider: React.FC<Props> = ({ children }) => {
    const [feedback, setFeedback] = useState(null);
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);
    const [isAnimatingIn, setIsAnimatingIn] = useState(false);
    const queue: any = [];
    const feedbackRef = useRef(null);

    useEffect(() => {
        feedbackRef.current = feedback;
        if(!feedbackRef.current) return;
        setTimeout(() => {
            setIsAnimatingIn(true);
        }, 200);

        setTimeout(() => {
            setIsAnimatingIn(false);
            setIsAnimatingOut(true);
            setTimeout(() => {
                setFeedback(null);
            }, 400);
        }, 3500);
    }, [feedback]);

    const addToQueue = useMemo(() => (feedback: any) => {
        queue.push(feedback);
        const interval = setInterval(() => {
            if(!queue.length) clearInterval(interval);
            if(!feedbackRef.current) {
                setFeedback(queue[0])
                queue.shift();
            };
        }, 500);
    }, []);

    const value = {
        setFeedback: addToQueue
    }

    return(
        <FeedbackContext.Provider value={value}>
            {children}
            <div className="feedback-container">
                {feedback && (
                    <div className={`feedback-tip${isAnimatingIn ? ' animate-in' : ''}${isAnimatingOut ? ' animate-out' : ''}`}>
                        {feedback}
                    </div>
                )}
            </div>
        </FeedbackContext.Provider>
    )
}