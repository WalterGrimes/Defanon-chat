import React, { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Button, Row, Col, Form, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useChatActionsForSignChat } from '../hooks/useChatActionsForSignChat';

interface EnterChatProps {
    initialName?: string;
}

const EnterChat = ({ initialName = '' }: EnterChatProps) => {
    const [name, setName] = useState(initialName);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const { handleSignUp } = useChatActionsForSignChat()

    const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setName(value);
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setIsLoading(true)
        setError(null);

        try {
            await handleSignUp(name)

        } catch (err: any) {
            setError(err.message || "Ошибка регистрации")
        } finally {
            setIsLoading(false)
        }

    };

    return (
        <React.Fragment>
            <Row
                className='d-flex justify-content-center align-items-center w-100 mt-5'
                style={{ minHeight: '100%' }}
            >
                <Col xs={10} sm={10} md={4} lg={4} className='mx-auto mt-5'>

                    {error && (
                        <Alert variant='danger'>
                            {error}
                        </Alert>
                    )}

                    <Form onSubmit={handleSubmit}>
                        <Form.Group controlId='display-name' className="mt-3">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                autoFocus
                                required
                                type='text'
                                name='name'
                                value={name}
                                placeholder='Choose a username?'
                                onChange={handleNameChange}
                            />
                        </Form.Group>

                        <Button
                            disabled={isLoading}
                            variant='primary'
                            type='submit'
                            className='w-100 mt-4'
                        >
                            {isLoading ? (
                                <>
                                    <Spinner
                                        as='span'
                                        animation='grow'
                                        size='sm'
                                        role='status'
                                        aria-hidden='true'
                                        className="me-2"
                                    />
                                    Please wait...
                                </>
                            ) : (
                                <span>Create My Account</span>
                            )}
                        </Button>
                        <p className='pt-3 text-center'>
                            Already have an account? <Link to='/'>Login</Link>
                        </p>
                    </Form>
                </Col>
            </Row>
        </React.Fragment>
    );
};

export default EnterChat;