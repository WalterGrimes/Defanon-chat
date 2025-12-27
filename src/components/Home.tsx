import React from 'react';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import { Spinner } from 'react-bootstrap';
import { CometChat } from '@cometchat-pro/chat';
import { Link, Navigate } from 'react-router-dom';
import type { HomeState } from '../types/chat';


class Home extends React.Component<{}, HomeState> {
  state: HomeState = {
    name: '',
    user: null,
    error: null,
    redirect: false,
    isLoading: false,
  };

  handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ name: e.target.value })
  }

  handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const apiKey = import.meta.env.VITE_COMETCHAT_APIKEY;
    e.preventDefault();
    const name = this.state.name 
    this.setState({ name: '', isLoading: true })
    CometChat.login(name, apiKey)
      .then(loggedInUser => {
        this.setState({ redirect: true, user: loggedInUser, isLoading: false })
        localStorage.setItem('cometchat: authToken', loggedInUser.getAuthToken());
      }).catch(err => {
        this.setState({ error: err.message, isLoading: false })
      })
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
            {this.state.error !== null && (
              <Alert variant='danger'>{this.state.error}</Alert>
            )}
            <Form onSubmit={this.handleSubmit}>
              <Form.Group controlId='username'>
                <Form.Label>Username</Form.Label>
                <Form.Control
                  required
                  type='text'
                  value={this.state.name}
                  placeholder='Enter a Username'
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
                    Loading...
                  </>
                ) : (
                  <span>Login</span>
                )}
              </Button>
              <p className='pt-3'>
                Don't have an account? <Link to='/signup'>Create One</Link>
              </p>
            </Form>
          </Col>
        </Row>
      </React.Fragment>
    );
  }
}

export default Home;