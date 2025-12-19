import React from 'react';
import type { ChangeEvent } from 'react';
import Button from 'react-bootstrap/Button'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Alert from 'react-bootstrap/Alert'
import Spinner from 'react-bootstrap/Spinner'
import { Link } from 'react-router-dom'
import type { SignupState } from '../types/chat';


class Signup extends React.Component<{}, SignupState> {
    state: SignupState= {
        uid: '',
        name: '',
        email: '',
        UIDError: null,
        errors: null,
        redirect: false,
        isLoading: false
    };
//sdlvksalkv

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
        const { uid, name, email } = this.state;
        this.setState({ uid: '', name: '', email: '', isLoading: true });
        fetch('https://api.cometchat.com/v1/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                 APP_ID: import.meta.env.VITE_CONFIG_APP_ID,
                 API_KEY:  import.meta.env.VITE_COMETCHAT_APIKEY
            },
            body: JSON.stringify({
                uid,
                name,
                email
            })
        }).then(response => response.json())
            .then(data => {
                const error = data.error;
                if (error) {
                    this.setState(
                        {
                            isLoading: false,
                            errors: { ...error.details }
                        },
                        () => {
                            this.showErrors();
                        }
                    );
                    return;
                }
                this.setState({
                    isLoading: false,
                    redirect: true
                })
            })
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
        if (this.state.redirect) return null;
        return (
            <React.Fragment>
                <Row
                    className='d-flex justify-content-center align-items-center w-100 mt-5'
                    style={{
                        minHeight: '100%'
                    }}
                >
                    <Col>
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
                            <Form.Group controlId='email'>
                                <Form.Label>Email Address</Form.Label>
                                <Form.Control
                                    required
                                    type='email'
                                    name='email'
                                    value={this.state.email}
                                    placeholder='Your email address'
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