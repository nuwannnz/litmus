import { Link } from 'react-router-dom';
import { appPaths } from '@litmus/core';
import { Chip } from '@litmus/ui';
import { PREVIEW_COLUMNS } from '../content';

/** Static screenshot-alike of the Week board, framed in a browser chrome. */
export function AppPreview() {
  return (
    <Link className="preview" to={appPaths.week} aria-label="Open the Litmus workspace">
      <div className="preview-chrome">
        <span className="lights">
          <i />
          <i />
          <i />
        </span>
        <span className="urlbar">app.litmus.so/week</span>
      </div>
      <div className="preview-body">
        <div className="preview-head">
          <b>My Week</b>
          <span>August 10 – 16, 2026</span>
        </div>
        <div className="preview-board">
          {PREVIEW_COLUMNS.map((column) => (
            <div key={column.name} className={`preview-col ${column.isToday ? 'is-today' : ''}`}>
              <header>
                {column.name} <span>{column.num}</span>
              </header>
              {column.cards.map((card) => (
                <div key={card.title} className="mini">
                  <b>{card.title}</b>
                  <span className="row">
                    <Chip color={card.color} dot>
                      {card.category}
                    </Chip>
                    <span>{card.meta}</span>
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </Link>
  );
}
