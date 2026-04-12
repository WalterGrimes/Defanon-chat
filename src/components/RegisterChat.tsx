import React, { useEffect, useState } from 'react';
import { Button, Row, Col, Form, Alert, Spinner } from 'react-bootstrap';
import { CometChat } from "@cometchat/chat-sdk-javascript";
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/ChatContext';

interface RegisterChatProps {
  initialName?: string;
}

const RegisterChat = ({ initialName = '' }: RegisterChatProps) => {
  const [name, setName] = useState(initialName);
  const { user, setUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [redirect, setRedirect] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    CometChat.getLoggedinUser().then(user => {
      if (user) navigate('/chatboxes');
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const apiKey = import.meta.env.VITE_COMETCHAT_APIKEY;

    setIsLoading(true);
    setError(null);

    try {
      const savedUID = localStorage.getItem(`anon_uid_${name.toLowerCase()}`);

      if (!savedUID) {
        throw new Error("Доступ запрещен или такого аккаунта не существует.");
      }

      const loggedInUser = await CometChat.login(savedUID, apiKey);
      setUser(loggedInUser);
      localStorage.setItem('cometchat:authToken', loggedInUser.getAuthToken());
      setRedirect(true);
    } catch (err: any) {
      setError(err.message || "An error occurred during login"); 4
    } finally {
      setIsLoading(false);
    }
  };

  if (redirect && user) {
    return <Navigate to="/chatboxes" state={{ user }} />;
  }

  return (
    <Row
      className='d-flex justify-content-center align-items-center w-100 mt-5'
      style={{ minHeight: '100vh' }}
    >
      <Col xs={10} sm={10} md={4} lg={4} className='mx-auto mt-5'>
        {error && <Alert variant='danger'>{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group controlId='username' className="mb-3">
            <Form.Label>Username</Form.Label>
            <Form.Control
              required
              type='text'
              value={name}
              placeholder='Enter a Username'
              onChange={handleChange}
            />
          </Form.Group>

          <Button
            disabled={isLoading}
            variant='primary'
            type='submit'
            className='w-100'
          >
            {isLoading ? (
              <>
                <Spinner
                  as='span'
                  animation='border'
                  size='sm'
                  role='status'
                  aria-hidden='true'
                  className="me-2"
                />
                Loading...
              </>
            ) : (
              'Login'
            )}
          </Button>

          <p className='pt-3'>
            Don't have an account? <Link to='/signup'>Create One</Link>
          </p>
        </Form>
      </Col>
    </Row>
  );
};

export default RegisterChat;