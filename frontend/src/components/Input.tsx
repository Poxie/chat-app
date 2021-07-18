import { useMemo, useState } from "react"
import './Input.css'

interface Props {
    placeholder?: string;
    onSubmit?: (value: string) => void;
    onChange?: (value: string) => void;
    disabled?: boolean;
}

export const Input: React.FC<Props> = ({ placeholder, onSubmit, onChange, disabled }) => {
    const [value, setValue] = useState('');

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if(!value) return;
        if(onSubmit) onSubmit(value);
        setValue('');
    };

    const handleChange = useMemo(() => (value: string) => {
        if(onChange) onChange(value);
        setValue(value);
    }, []);

    return(
        <form className="input" onSubmit={handleSubmit}>
            <input 
                type="text" 
                placeholder={placeholder}
                value={value}
                disabled={disabled}
                onChange={(e) => handleChange(e.target.value)}
            />
        </form>
    )
}