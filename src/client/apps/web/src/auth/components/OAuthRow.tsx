import { Button, Icon } from '@litmus/ui';

/** Third-party sign-in (PRD FR-7). Wired up when the auth API lands. */
export function OAuthRow({ onUse }: { onUse: () => void }) {
  return (
    <>
      <div className="oauth">
        <Button onClick={onUse}>
          <Icon name="google" size="sm" /> Google
        </Button>
        <Button onClick={onUse}>
          <Icon name="apple" size="sm" /> Apple
        </Button>
      </div>
      <div className="or">or</div>
    </>
  );
}
