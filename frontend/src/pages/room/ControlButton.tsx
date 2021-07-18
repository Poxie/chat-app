import { Clickable } from "../../components/Clickable"
import { Flex } from "../../components/Flex"

interface Props {
    onClick: () => void;
    active: boolean;
    children: any;
}

export const ControlButton: React.FC<Props> = ({ onClick, active, children }) => {
    return(
        <Clickable className={`control-btn${active ? ' active-btn' : ''}`} onClick={onClick}>
            <Flex alignItems={'center'} style={{height: '100%'}} justifyContent={'center'}>
                {children}
            </Flex>
        </Clickable>
    )
}