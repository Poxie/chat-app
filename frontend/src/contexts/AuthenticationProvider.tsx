import { createContext, useContext, useEffect, useState } from "react"
import { useParams } from "react-router-dom";
import { UserModal } from "../modals/UserModal";
import { WarningModal } from "../modals/WarningModal";
import { AuthenticationContext as AuthenticationContextType, ContextUser } from "../types/AuthenticationContext";
import { Params } from "../types/Params";
import { useModal } from "./ModalProvider";

// @ts-ignore
const AuthenticationContext = createContext<AuthenticationContextType>({user: undefined});

export const useAuthentication = () => {
    return useContext(AuthenticationContext);
}

const getUser = () => {
    try {
        return JSON.parse(window.localStorage.user);
    } catch(e) {
        return undefined;
    }
}
interface Props {
    children: any;
}
interface User {
    username: string;
}
export const AuthenticationProvider: React.FC<Props> = ({ children }) => {
    const [user, setUser] = useState<ContextUser>(getUser());
    const { roomId } = useParams<Params>();
    const { setModal } = useModal();

    useEffect(() => {
        if(!user && roomId) setModal(
            <UserModal 
                onSave={user => {
                    window.localStorage.user = JSON.stringify(user);
                    setUser(user);
                    setModal(null);
                }}
            />
        )
    }, [roomId]);

    // Sending warning if user opens new tab
    useEffect(() => {
        localStorage.openpages = Date.now();
        var onLocalStorageEvent = function(e: any){
            if(e.key == "openpages"){
                // Listen if anybody else is opening the same page!
                localStorage.openedTab = true;
            }
            if(e.key == "openedTab"){
                setModal(
                    <WarningModal 
                        title={'WARNING: Multiple tabs open'}
                        description={'Due to lack of resources and a better server, this application is made using Mesh. This essentially means the users are connected to each other, and not through a server. Therefore, opening multiple tabs may cause high CPU and GPU usage, which may cause extreme lag.'}
                    />
                )
            }
        };
        if(localStorage.openedTab !== 'true') {
            window.addEventListener('storage', onLocalStorageEvent, false);
        }
    }, []);

    if(!user) return <div></div>
    
    const value = {
        user
    }

    return(
        <AuthenticationContext.Provider value={value}>
            {children}
        </AuthenticationContext.Provider>
    )
}