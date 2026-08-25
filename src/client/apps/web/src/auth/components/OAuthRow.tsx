import { Button, Icon } from '@litmus/ui';

/**
 * Third-party sign-in (PRD FR-7). Google/Apple land with S-4.6 — the buttons
 * stay visible but inert rather than faking a sign-in.
 */
export function OAuthRow() {
  return (
    <>
      <div className="oauth">
        <Button type="button" disabled title="Coming soon">
          <Icon name="google" size="sm" /> Google
        </Button>
        <Button type="button" disabled title="Coming soon">
          <Icon name="apple" size="sm" /> Apple
        </Button>
      </div>
      <div className="or">or</div>
    </>
  );
}
