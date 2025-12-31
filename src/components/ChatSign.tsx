import React from 'react';
import type { ChangeEvent } from 'react';
import Button from 'react-bootstrap/Button'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Alert from 'react-bootstrap/Alert'
import Spinner from 'react-bootstrap/Spinner'
import { Link, Navigate } from 'react-router-dom'
import type { SignupState } from '../types/chat';
import { CometChat } from '@cometchat-pro/chat';


class Signup extends React.Component<{}, SignupState> {
    state: SignupState= {
        uid: '',
        name: '',
        UIDError: null,
        errors: null,
        redirect: false,
        isLoading: false
    };

    handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const name = e.target.name as keyof SignupState;
        const value = e.target.value;

        if (name === 'uid' && value.includes(' ')) {
            this.setState({ UIDError: 'Username cannot contain white spaces' })
        } else {
            this.setState({ UIDError: null });
        }

        this.setState(prev => ({
            ...prev,
            [name]: value
        }))

    };

    handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const { uid, name } = this.state;
        this.setState({ isLoading: true})
        const apiKey = import.meta.env.VITE_COMETCHAT_APIKEY;

        const user = new CometChat.User(uid);
        user.setName(name)

       CometChat.createUser(user,apiKey).then(
        () => {
            this.setState({
                uid: '',
                name: '',
                isLoading: false,
                redirect: true,
            });
        },
        (error) => {
            this.setState({
                isLoading: false,
                errors: {message: [error.message || "Что-то пошло не так"] }
            });
        }
       )
    }

    showErrors = () => {
        const {errors} = this.state;
        let errorMessages: string[] = [];
        if (errors) {
            for (const error in errors) {
                errorMessages = [...errorMessages, ...errors[error]]
            }
        }
        return errorMessages;
    }

    render() {
        if (this.state.redirect) return <Navigate to='/' />;
        
        return (
            <React.Fragment>
                <Row
                    className='d-flex justify-content-center align-items-center w-100 mt-5'
                    style={{
                        minHeight: '100%'
                    }}
                >
                    <Col xs={10} sm={10} md={4} lg={4} className='mx-auto mt-5'>
                        {this.state.errors !== null && (
                            <Alert variant='danger'>
                                <ul>
                                    {this.showErrors().map(err => (
                                        <li key={err}>{err}</li>
                                    ))}
                                </ul>
                            </Alert>
                        )}
                        <Form onSubmit={this.handleSubmit}>
                            <Form.Group controlId='username'>
                                <Form.Label>User ID</Form.Label>
                                <Form.Control
                                    required
                                    type='text'
                                    name='uid'
                                    value={this.state.uid}
                                    placeholder='Choose a username'
                                    onChange={this.handleChange}
                                />
                                {this.state.UIDError !== null && (
                                    <Form.Control.Feedback
                                        style={{ display: 'block' }}
                                        type='invalid'
                                    >
                                        {this.state.UIDError}
                                    </Form.Control.Feedback>
                                )}
                            </Form.Group>
                            <Form.Group controlId='display-name'>
                                <Form.Label>Name</Form.Label>
                                <Form.Control
                                    required
                                    type='text'
                                    name='name'
                                    value={this.state.name}
                                    placeholder='What is your name?'
                                    onChange={this.handleChange}
                                />
                            </Form.Group>
                            <Button
                                disabled={this.state.isLoading}
                                variant='primary'
                                type='submit'
                                className='btn-block'
                            >
                                {this.state.isLoading ? (
                                    <>
                                        <Spinner
                                            as='span'
                                            animation='grow'
                                            size='sm'
                                            role='status'
                                            aria-hidden='true'
                                        />
                                        Please wait...
                                    </>
                                ) : (
                                    <span>Create My Account</span>
                                )}
                            </Button>
                            <p className='pt-3'>
                                Already have an account? <Link to='/'>Login</Link>
                            </p>
                        </Form>
                    </Col>
                </Row>
            </React.Fragment>
        );
    }
}

export default Signup;