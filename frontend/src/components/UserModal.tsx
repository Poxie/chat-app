import { useMemo, useState } from "react";
import { ContextUser } from "../types/AuthenticationContext";
import { Button } from "./Button";
import { Input } from "./Input"
import { Modal } from "./Modal"
import { ModalHeader } from "./ModalHeader";
// import './UserModal.scss';

interface Props {
    onSave: ({username}: ContextUser) => void;
}

export const UserModal: React.FC<Props> = ({ onSave }) => {
    const [username, setUsername] = useState('');
    
    const handleSubmit = useMemo(() => () => {
        console.log(username);
        if(username === '') return;
        onSave({username: username});
    }, [username]);

    return(
        <Modal>
            <ModalHeader 
                text={'Before entering, please choose a username'}
            />
            <Input 
                placeholder={'Choose a username...'}
                onChange={setUsername}
            />
            <Button onClick={handleSubmit} style={{marginTop: '15px'}}>
                Enter
            </Button>
        </Modal>
    )
}