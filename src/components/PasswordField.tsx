import React, { useState } from "react";
import { Button, InputGroup, Form } from "react-bootstrap";
import { FaEye, FaEyeSlash } from "react-icons/fa";

interface PasswordFieldProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PasswordField = ({ value, onChange }: PasswordFieldProps) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <InputGroup>
            <Form.Control 
                type={showPassword ? "text" : "password"}
                placeholder="Password for private mode (optional)"
                value={value}
                onChange={onChange} 
            />
            <Button variant="outline-secondary" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
            </Button>
        </InputGroup>
    );
};

export default PasswordField;