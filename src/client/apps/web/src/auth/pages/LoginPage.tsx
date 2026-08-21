import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { appPaths } from '@litmus/core';
import { Button, CheckMark, Field } from '@litmus/ui';
import { AuthLayout } from '../components/AuthLayout';
import { OAuthRow } from '../components/OAuthRow';
import { PasswordField } from '../components/PasswordField';
import { useAuth } from '../AuthProvider';

export function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('nuwan@litmus.so');
  const [password, setPassword] = useState('demopassword');

  const from = (location.state as { from?: string } | null)?.from ?? appPaths.week;

  const enter = () => {
    signIn(email);
    navigate(from, { replace: true });
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    enter();
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
      <OAuthRow onUse={enter} />

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
          <label>
            <CheckMark checked /> Remember me
          </label>
          <Link to={appPaths.forgotPassword}>Forgot password?</Link>
        </div>

        <Button type="submit" variant="primary" size="lg" block>
          Sign in
        </Button>
      </form>
    </AuthLayout>
  );
}
