import { Link } from 'react-router-dom';
import { Icon } from '@litmus/ui';
import { Brand } from '../../components/Brand';
import { FOOTER_COLUMNS } from '../content';

const SOCIALS = [
  { icon: 'twitter', label: 'Twitter' },
  { icon: 'github', label: 'GitHub' },
  { icon: 'linkedin', label: 'LinkedIn' },
] as const;

export function SiteFooter() {
  return (
    <footer className="site-foot">
      <div className="foot-top">
        <div>
          <Brand />
          <p>The calm home for your week.</p>
          <div className="socials">
            {SOCIALS.map((social) => (
              <a key={social.label} href={`#${social.label.toLowerCase()}`} aria-label={social.label}>
                <Icon name={social.icon} size="sm" />
              </a>
            ))}
          </div>
        </div>
        <div className="foot-cols">
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title} className="foot-col">
              <h4>{column.title}</h4>
              {column.links.map((link) =>
                link.href.startsWith('#') ? (
                  <a key={link.label} href={link.href}>
                    {link.label}
                  </a>
                ) : (
                  <Link key={link.label} to={link.href}>
                    {link.label}
                  </Link>
                ),
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="foot-bottom">
        <span>© 2026 Litmus. All rights reserved.</span>
        <nav>
          <a href="#privacy">Privacy</a>
          <a href="#terms">Terms</a>
          <a href="#cookies">Cookies</a>
        </nav>
      </div>
    </footer>
  );
}
