import { Button } from "../../components/Button"
import { Flex } from "../../components/Flex"
import { Input } from "../../components/Input"
import { ConnectionIcon } from "./ConnectionIcon";
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