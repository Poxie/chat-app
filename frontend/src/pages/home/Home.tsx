import { Flex } from "../../components/Flex"
import { ConnectionIcon } from "../../icons/ConnectionIcon";
import './Home.scss';
import { HomeHeader } from "./HomeHeader";
import { HomeOptions } from "./HomeOptions";

export const Home = () => {
    return(
        <Flex className="home" alignItems={'center'} justifyContent={'space-between'}>
            <div className="home-main">
                <HomeHeader />
                <HomeOptions />
            </div>
            <div className="home-illustrations">
                <ConnectionIcon />
            </div>
        </Flex>
    )
}