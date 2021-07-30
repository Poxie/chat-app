import { useState } from "react"
import { useHistory } from "react-router-dom"
import { Button } from "../../components/Button"
import { Flex } from "../../components/Flex"
import { Input } from "../../components/Input"

export const JoinMeeting = () => {
    const history = useHistory();
    const [code, setCode] = useState('');

    const joinMeeting = () => {
        history.push(`/${code}`);
    }

    return(
        <Flex className="join-meeting">
            <Input 
                placeholder={'Enter code for meeting...'}
                onChange={setCode}
                onSubmit={joinMeeting}
                replaceString={[' ', '-']}
                noCaps={true}
            />
            <Button type={'secondary'} onClick={joinMeeting}>
                <Flex alignItems={'center'} justifyContent={'center'}>
                    <svg className="first-arrow" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M13.025 1l-2.847 2.828 6.176 6.176h-16.354v3.992h16.354l-6.176 6.176 2.847 2.828 10.975-11z"/></svg>
                    <svg className="second-arrow" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M13.025 1l-2.847 2.828 6.176 6.176h-16.354v3.992h16.354l-6.176 6.176 2.847 2.828 10.975-11z"/></svg>
                </Flex>
            </Button>
        </Flex>
    )
}