import { createContext, useContext, useMemo, useState } from "react"
import { ModalContext as ModalContextType } from "../types/ModalContext";

const ModalContext = createContext<ModalContextType>({setModal: () => {}});

export const useModal = () => {
    return useContext(ModalContext);
};

interface Props {
    children: any;
}
export const ModalProvider: React.FC<Props> = ({ children }) => {
    const [modal, setModal] = useState<any>(null);

    const close = useMemo(() => () => {
        setModal(null);
    }, []);

    const value = {
        setModal
    }

    return(
        <ModalContext.Provider value={value}>
            {children}
            <div className="modal-container">
                {modal && (
                    <div className="back-drop" onClick={close} />
                )}
                {modal}
            </div>
        </ModalContext.Provider>
    )
}