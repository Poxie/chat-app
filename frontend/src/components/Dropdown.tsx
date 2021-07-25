import { useEffect, useMemo, useState } from "react"
import { Clickable } from "./Clickable";
import './Dropdown.css';

interface Props {
    tabs: Tab[];
    active?: string;
    onChange?: (value: string) => void;
    style?: any;
}
interface Tab {
    label: string;
    id: string;
}

export const Dropdown: React.FC<Props> = ({ tabs, active, onChange, style }) => {
    const [tab, setTab] = useState(active);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        setTab(active || tabs[0]?.id);
    }, [active, tabs]);
    const handleClick = useMemo(() => (tab: string) => {
        setTab(tab);
        setOpen(false);
        if(onChange) onChange(tab);
    }, [setTab, onChange]);
    const toggleActive = useMemo(() => () => {
        setOpen(previous => !previous);
    }, []);

    return(
        <div className={`dropdown${open ? ' active' : ''}`} style={style} onBlur={() => setOpen(false)} tabIndex={0}>
            <Clickable className="active-tab" onClick={toggleActive}>
                {tabs.find(t => t.id == tab)?.label}
            </Clickable>
            <div className="dropdown-tabs">
                {tabs.map((tab, key) => {
                    const tabId = tab.id;
                    return(
                        <Clickable className="dropdown-tah" onClick={() => handleClick(tabId)} key={tabId}>
                            {tab.label}
                        </Clickable>
                    )
                })}
            </div>
        </div>
    )
}