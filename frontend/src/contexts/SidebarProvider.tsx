import { createContext, useContext, useState } from "react"
import { SidebarContext as SidebarContextType } from "../types/SidebarContext";

// @ts-ignore
const SidebarContext = createContext<SidebarContextType>();

export const useSidebar = () => {
    return useContext(SidebarContext);
}

interface Props {
    children: any;
}
export const SidebarProvider: React.FC<Props> = ({ children }) => {
    const [sidebar, setSidebar] = useState<any>({type: null, open: false});

    const toggleSidebar = (state: boolean, type: 'chat' | 'attachments' | null) => {
        setSidebar((previous: any) => {
            if(previous.open && type !== previous.type) {
                return {type, open: true};
            }
            return {type, open: state};
        });
    }

    const value = {
        open: sidebar.open,
        type: sidebar.type,
        toggleSidebar
    }

    return(
        <SidebarContext.Provider value={value}>
            {children}
        </SidebarContext.Provider>
    )
}