import { createContext, useContext, useEffect, useState } from "react"
import { useParams } from "react-router-dom";
import { UserModal } from "../components/UserModal";
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