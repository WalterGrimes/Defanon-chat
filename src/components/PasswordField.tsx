import React from "react";
import { Button, InputGroup, Form } from "react-bootstrap";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { usePasswordToggle } from "../hooks/usePasswordToggle";

interface PasswordFieldProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
}

const PasswordField = ({ value, onChange, placeholder }: PasswordFieldProps) => {
    const { type, isVisiblePassword, toggle } = usePasswordToggle();

    return (
        <InputGroup>
            <Form.Control
                type={type}
                placeholder={placeholder || "Password for private mode"} onChange={onChange}
            />
            <Button variant="outline-secondary" onClick={toggle} type="button">
                {isVisiblePassword ? <FaEyeSlash /> : <FaEye />}
            </Button>
        </InputGroup>
    );
};


export default PasswordField;