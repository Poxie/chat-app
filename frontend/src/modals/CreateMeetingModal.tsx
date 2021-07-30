import { useState } from "react";
import { useHistory } from "react-router-dom";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Modal } from "../components/Modal";
import { ModalFooter } from "../components/ModalFooter";
import { ModalHeader } from "../components/ModalHeader";
import { useModal } from "../contexts/ModalProvider";

const generateCode = () => {
    const opts = 'abcdefghijklmnopqrstuvwxyz';
    let code = [];
    for(let i = 0; i < 4; i++) {
        let tempCode = '';
        for(let i = 0; i < 4; i++) {
            tempCode += opts[Math.floor(Math.random() * (opts.length - 1))];
        }
        code.push(tempCode);
    }
    return code.join('-');
}
export const CreateMeetingModal = () => {
    const history = useHistory();
    const { close } = useModal();
    const [code, setCode] = useState(generateCode());

    const createMeeting = () => {
        if(!code) return;
        history.push(`/${code}`);
        close();
    }

    return(
        <Modal>
            <ModalHeader 
                text={'Create Meeting Code'}
            >
                <Input 
                    defaultValue={code}
                    onChange={setCode}
                    replaceString={[' ', '-']}
                    noCaps={true}
                    placeholder={'Create meeting code...'}
                    onSubmit={createMeeting}
                />
            </ModalHeader>
            <ModalFooter>
                <Button onClick={createMeeting}>
                    Create Meeting
                </Button>
            </ModalFooter>
        </Modal>
    )
}