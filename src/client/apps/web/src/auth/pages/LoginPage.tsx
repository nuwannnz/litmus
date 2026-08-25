import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { appPaths } from '@litmus/core';
import { Button, Field } from '@litmus/ui';
import { AuthLayout } from '../components/AuthLayout';
import { OAuthRow } from '../components/OAuthRow';
import { PasswordField } from '../components/PasswordField';
import { useAuth } from '../AuthProvider';

export function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const from = (location.state as { from?: string } | null)?.from ?? appPaths.week;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await signIn(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed — try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      lede="Sign in to pick up where you left off."
      asideTitle="Plan your week with clarity."
      asideBody="Litmus brings your tasks, projects, and notes into one calm, focused workspace."
      footer={
        <>
          Don&apos;t have an account? <Link to={appPaths.register}>Sign up</Link>
        </>
      }
    >
      <OAuthRow />

      <form onSubmit={submit}>
        <Field caps={false} label="Email">
          <input
            className="input"
            type="email"
            name="email"
            value={email}
            placeholder="you@example.com"
            required
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>

        <Field caps={false} label="Password">
          <PasswordField value={password} onChange={setPassword} />
        </Field>

        <div className="field-row">
          <Link to={appPaths.forgotPassword}>Forgot password?</Link>
        </div>

        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" variant="primary" size="lg" block disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </AuthLayout>
  );
}
