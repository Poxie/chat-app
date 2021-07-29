import { createContext, useContext, useMemo, useState } from "react"
import { ModalContext as ModalContextType } from "../types/ModalContext";

const ModalContext = createContext<ModalContextType>({setModal: () => {}, close: () => {}});

export const useModal = () => {
    return useContext(ModalContext);
};

interface Props {
    children: any;
}
export const ModalProvider: React.FC<Props> = ({ children }) => {
    const [modal, setModal] = useState<any>(null);
    const [animateIn, setAnimateIn] = useState(false);
    const [animateOut, setAnimateOut] = useState(false);

    const close = useMemo(() => () => {
        setAnimateOut(true);
        setTimeout(() => {
            setModal(null);
            setAnimateOut(false);
            setAnimateIn(false);
        }, 340);
    }, []);

    const animateModal = useMemo(() => (modal: any) => {
        setModal(modal);
        setTimeout(() => {
            setAnimateIn(true);
        }, 10);
    }, []);

    const value = {
        setModal: animateModal,
        close
    }

    const className = `${animateIn ? ' animate-in' : ''}${animateOut ? ' animate-out' : ''}`;
    return(
        <ModalContext.Provider value={value}>
            {children}
            <div className="modal-container">
                {modal && (
                    <>
                    <div className={`back-drop` + className} onClick={close} />
                    <div className={'modal-item' + className}>
                        {modal}
                    </div>
                    </>
                )}
            </div>
        </ModalContext.Provider>
    )
}