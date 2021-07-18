import { Flex } from "../../components/Flex";

interface Props {
    username: string;
}

export const LetterIcon: React.FC<Props> = ({ username }) => {
    let name = '';
    username.split(' ').forEach(n => name += n.slice(0,1).toUpperCase());
    return(
        <Flex className="letter-icon" alignItems={'center'} justifyContent={'center'}>
            {name}
        </Flex>
    )
}