import { createContext, useContext, useState } from "react"
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

    const value = {
        setModal
    }

    return(
        <ModalContext.Provider value={value}>
            {children}
            <div className="modal-container">
                {modal && (
                    <div className="back-drop" />
                )}
                {modal}
            </div>
        </ModalContext.Provider>
    )
}