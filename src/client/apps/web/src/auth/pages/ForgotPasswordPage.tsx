import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { appPaths } from '@litmus/core';
import { Button, Field, Icon } from '@litmus/ui';
import { AuthLayout } from '../components/AuthLayout';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('nuwan@litmus.so');
  const [sent, setSent] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <AuthLayout
      title="Reset your password"
      lede="Enter your account email and we'll send you a secure link to reset it."
      asideTitle="A fresh start is one link away."
      asideBody="We'll get you back into your workspace in no time."
      footer={
        <>
          Remembered it? <Link to={appPaths.login}>Back to sign in</Link>
        </>
      }
    >
      {sent ? (
        <p className="hint" role="status">
          <Icon name="check-circle" size="sm" /> If {email} has an account, a reset link is on its
          way.
        </p>
      ) : (
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

          <Button type="submit" variant="primary" size="lg" block>
            Send reset link
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
