import { Clickable } from "../../components/Clickable"
import { Flex } from "../../components/Flex"
import { Tooltip } from "../../components/Tooltip"

interface Props {
    onClick: () => void;
    active: boolean;
    children: any;
    tooltip: string | null;
}

export const ControlButton: React.FC<Props> = ({ onClick, active, children, tooltip }) => {
    return(
        <Clickable className={`control-btn${active ? ' active-btn' : ''}`} onClick={onClick}>
            {tooltip ? (
                <Tooltip tooltip={tooltip} style={{height: '100%'}}>
                    <Flex alignItems={'center'} style={{height: '100%'}} justifyContent={'center'}>
                        {children}
                    </Flex>
                </Tooltip>
            ) : (
                <Flex alignItems={'center'} style={{height: '100%'}} justifyContent={'center'}>
                    {children}
                </Flex>
            )}
        </Clickable>
    )
}