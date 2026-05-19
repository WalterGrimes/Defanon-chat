import { useRef, useState } from "react";
import { Button } from "react-bootstrap";
import { BsSearch, BsX } from "react-icons/bs";
import s from "./SearchBox.module.css";

interface SearchBoxProps {
    value: string;
    onChange: (value: string) => void;
    theme: string;
}

export const SearchBox = ({ value, onChange, theme }: SearchBoxProps) => {
    const [open, setOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const toggle = () => {
        setOpen(prev => {
            if (!prev) {
                setTimeout(() => inputRef.current?.focus(), 50);
            } else {
                onChange('');
            }
            return !prev;
        });
    };

    const handleClear = () => {
        onChange('');
        inputRef.current?.focus();
    };

    return (
        <div className={s.searchWrapper}>
            <input
                ref={inputRef}
                type="text"
                className={`${s.searchInput} ${open ? s.open : ''}`}
                placeholder="Search boxes..."
                value={value}
                onChange={e => onChange(e.target.value)}
            />

            {open && value && (
                <button className={s.clearBtn} onClick={handleClear} title="Clear">
                    <BsX size={16} />
                </button>
            )}

            <Button
                variant={theme === 'light' ? 'outline-dark' : 'outline-light'}
                className={`${s.searchBtn} ${open ? s.active : ''}`}
                onClick={toggle}
                title={open ? 'Close search' : 'Search boxes'}
            >
                <BsSearch size={15} />
            </Button>
        </div>
    );
};