import React, { useEffect, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { CometChat } from '@cometchat/chat-sdk-javascript';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/ChatContext';
import { ThemeSwitcher } from '../../ThemeChange/ThemeSwitcher';
import styles from './RegisterChat.module.css';

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
    CometChat.getLoggedinUser().then(u => {
      if (u) navigate('/chatboxes');
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const apiKey = import.meta.env.VITE_COMETCHAT_APIKEY;

    setIsLoading(true);
    setError(null);

    try {
      const savedUID = localStorage.getItem(`anon_uid_${name.toLowerCase()}`);
      if (!savedUID) {
        throw new Error('This account does not belong to this device or it has been deleted.');
      }
      const loggedInUser = await CometChat.login(savedUID, apiKey);
      setUser(loggedInUser);
      localStorage.setItem('cometchat:authToken', loggedInUser.getAuthToken());
      setRedirect(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
    } finally {``
      setIsLoading(false);
    }
  };

  if (redirect && user) {
    return <Navigate to="/chatboxes" state={{ user }} />;
  }

  return (
    <div className={styles.page}>
      <div className={styles.brand}>
        <h1 className={styles.logo}>
          Anon<span className={styles.logoAccent}>Chat</span>
        </h1>
        <p className={styles.tagline}>Anonymous chat. No accounts. Just talk.</p>
      </div>

      <div className={styles.themeSwitcher}>
        <ThemeSwitcher />
      </div>

      <div className={styles.card}>
        {error && <div className={styles.alertBox}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="username" className={styles.label}>
              Your username
            </label>
            <input
              id="username"
              required
              type="text"
              value={name}
              placeholder="Enter your username"
              onChange={e => setName(e.target.value)}
              maxLength={15}
              className={styles.input}
            />
          </div>

          <button type="submit" disabled={isLoading} className={styles.button}>
            {isLoading ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                Signing in...
              </>
            ) : 'Sign In'}
          </button>
        </form>

        <p className={styles.footer}>
          Don't have an account?{' '}
          <Link to="/signup">Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterChat;