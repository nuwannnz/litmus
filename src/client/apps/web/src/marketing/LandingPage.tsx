import { Link } from 'react-router-dom';
import { appPaths } from '@litmus/core';
import { Button, Icon } from '@litmus/ui';
import { SiteNav } from './components/SiteNav';
import { AppPreview } from './components/AppPreview';
import { SiteFooter } from './components/SiteFooter';
import { FEATURES, MODULE_HIGHLIGHTS } from './content';
import './marketing.css';

export function LandingPage() {
  return (
    <div className="site">
      <SiteNav />

      <section className="hero">
        <span className="badge">
          <Icon name="sparkle" size="sm" /> Now with a full Notes module
        </span>
        <h1>The calm home for your week.</h1>
        <p className="lede">
          Litmus unifies your weekly tasks, projects, and notes in one minimal, focused workspace —
          so you always know what to do next.
        </p>
        <div className="cta-row">
          <Link to={appPaths.register}>
            <Button variant="primary" size="lg">
              Get started free <Icon name="arrow-right" size="sm" />
            </Button>
          </Link>
          <Link to={appPaths.week}>
            <Button size="lg">
              <Icon name="play" size="sm" /> Watch demo
            </Button>
          </Link>
        </div>
        <p className="fineprint">Free forever · No credit card required</p>
        <AppPreview />
      </section>

      <section className="section section--tint" id="modules">
        <span className="eyebrow">Modules</span>
        <h2>Three tools, one calm flow.</h2>
        <p className="sub">
          Tasks, projects, and notes that actually talk to each other — no more juggling five apps.
        </p>

        <div className="cards">
          {MODULE_HIGHLIGHTS.map((module) => (
            <article key={module.title} className="module" data-color={module.color}>
              <span className="module-icon">
                <Icon name={module.icon} size="lg" />
              </span>
              <h3>{module.title}</h3>
              <p>{module.body}</p>
              <Link to={module.href}>
                Learn more <Icon name="arrow-right" size="sm" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="section" id="why">
        <span className="eyebrow">Why Litmus</span>
        <h2>Everything in its right place.</h2>

        <div className="grid-features">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="feature">
              <span className="feature-icon">
                <Icon name={feature.icon} />
              </span>
              <h3>{feature.title}</h3>
              <p>{feature.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="band">
        <h2>Ready to plan your week?</h2>
        <p>Join 12,000+ people who found their calm with Litmus. Free forever.</p>
        <Link to={appPaths.register}>
          <Button size="lg">
            Get started free <Icon name="arrow-right" size="sm" />
          </Button>
        </Link>
      </section>

      <SiteFooter />
    </div>
  );
}
