import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { appPaths } from '@litmus/core';
import { Button, Checkbox, Field } from '@litmus/ui';
import { AuthLayout } from '../components/AuthLayout';
import { OAuthRow } from '../components/OAuthRow';
import { PasswordField } from '../components/PasswordField';
import { useAuth } from '../AuthProvider';

/**
 * FR-4 registration. Local and hosted stacks differ on email confirmation —
 * with confirmations off (local default) `signUp` returns a session and the
 * user lands straight on the Week Board; where confirmation is required the
 * server's message surfaces in place instead.
 */
export function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [consentWarning, setConsentWarning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const enter = async () => {
    if (!agreed) {
      setConsentWarning(true);
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await signUp(name, email, password);
      // Success means a session: the Week Board renders its empty state.
      navigate(appPaths.week, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed — try again.');
    } finally {
      setBusy(false);
    }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    void enter();
  };

  return (
    <AuthLayout
      title="Create your account"
      lede="Start planning in minutes — no credit card required."
      asideTitle="Everything you need, in one place."
      asideBody="Litmus brings your tasks, projects, and notes into one calm, focused workspace."
      footer={
        <>
          Already have an account? <Link to={appPaths.login}>Sign in</Link>
        </>
      }
    >
      <OAuthRow />

      <form onSubmit={submit}>
        <Field caps={false} label="Full name">
          <input
            className="input"
            type="text"
            name="name"
            value={name}
            placeholder="Jane Doe"
            autoComplete="name"
            required
            onChange={(e) => setName(e.target.value)}
          />
        </Field>

        <Field caps={false} label="Email">
          <input
            className="input"
            type="email"
            name="email"
            value={email}
            placeholder="you@example.com"
            autoComplete="email"
            required
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>

        <Field caps={false} label="Password">
          <PasswordField value={password} onChange={setPassword} />
        </Field>

        <div className={`field-row ${consentWarning && !agreed ? 'needs-consent' : ''}`}>
          <label>
            <Checkbox
              checked={agreed}
              onToggle={() => {
                setAgreed((v) => !v);
                setConsentWarning(true);
              }}
              label="I agree to the Terms & Privacy Policy"
            />{' '}
            I agree to the <a href="#terms">Terms</a> &amp; <a href="#privacy">Privacy Policy</a>
          </label>
        </div>

        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" variant="primary" size="lg" block disabled={busy}>
          {busy ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
    </AuthLayout>
  );
}
