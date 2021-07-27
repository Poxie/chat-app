import { Flex } from "./Flex"

interface Props {
    children: any;
}

export const ModalFooter: React.FC<Props> = ({ children }) => {
    return(
        <Flex className="modal-footer" justifyContent={'flex-end'}>
            {children}
        </Flex>
    )
}