import React, { useState } from "react";
import { Button, InputGroup, Form } from "react-bootstrap"
import { FaEye, FaEyeSlash } from "react-icons/fa";

interface PasswordFieldProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PasswordField = ({ value, onChange }: PasswordFieldProps) => {
    const [showPassword, setShowPassword] = useState(false);
    const [InputPassword, setInputPassword] = useState("");

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        setInputPassword("");
    }


    return (
        <InputGroup>
            <Form.Control type={showPassword ? "text" : "password"} placeholder="Введите пароль" value={value} onChange={onChange} />
            <Button onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
                
            </Button>
        </InputGroup>
    )
}

export default PasswordField;