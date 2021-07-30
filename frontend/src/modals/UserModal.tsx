import { useMemo, useState } from "react";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Modal } from "../components/Modal";
import { ModalFooter } from "../components/ModalFooter";
import { ModalHeader } from "../components/ModalHeader";
import { ContextUser } from "../types/AuthenticationContext";
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
            >
                <Input 
                    placeholder={'Choose a username...'}
                    onChange={setUsername}
                    onSubmit={handleSubmit}
                />
            </ModalHeader>
            <ModalFooter>
                <Button onClick={handleSubmit} style={{width: '100%', margin: 0, padding: '12px 0'}}>
                    Enter
                </Button>
            </ModalFooter>
        </Modal>
    )
}