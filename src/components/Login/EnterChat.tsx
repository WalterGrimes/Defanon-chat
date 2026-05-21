import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useChatActionsForSignChat } from '../../hooks/useChatActionsForSignChat';
import { ThemeSwitcher } from '../../ThemeChange/ThemeSwitcher';
import styles from './EnterChat.module.css';

interface EnterChatProps {
    initialName?: string;
}

const EnterChat = ({ initialName = '' }: EnterChatProps) => {
    const [name, setName] = useState(initialName);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const { handleSignUp } = useChatActionsForSignChat();

    const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            await handleSignUp(name);
        } catch (err: any) {
            setError(err.message || 'Registration error');
        } finally {
            setIsLoading(false);
        }
    };

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
                        <label htmlFor="display-name" className={styles.label}>
                            Choose a username
                        </label>
                        <input
                            id="display-name"
                            autoFocus
                            required
                            type="text"
                            name="name"
                            value={name}
                            placeholder="example: anonchik"
                            onChange={handleNameChange}
                            maxLength={15}
                            className={styles.input}
                        />
                    </div>

                    <button type="submit" disabled={isLoading} className={styles.button}>
                        {isLoading ? (
                            <>
                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                Creating account...
                            </>
                        ) : 'Create Account'}
                    </button>
                </form>

                <p className={styles.footer}>
                    Already have an account?{' '}
                    <Link to="/">Sign in</Link>
                </p>
            </div>
        </div>
    );
};

export default EnterChat;