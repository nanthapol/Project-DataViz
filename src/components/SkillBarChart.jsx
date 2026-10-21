import { useMemo, useState } from 'react';
import { getSkills, pct } from '../utils/Utils';
import { topSkills } from '../utils/jobInsights';

const TOPS = [5, 10, 15, 20];

function nice(max) {
  if (max <= 0) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(max)));
  const m = max / p;
  const step = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find(s => s >= m) || 10;
  return step * p;
}

export default function SkillBarChart({ J, sel }) {
  const [metric, setMetric] = useState('count');
  const [topN, setTopN] = useState(10);
  const [scope, setScope] = useState('all');

  const used = scope !== 'all' && sel.includes(scope) ? [scope] : sel;
  const { total, rows } = useMemo(() => topSkills(J, null, used, 'All', 0, topN), [J, used.join('|'), topN]);

  const perJob = useMemo(() => Object.fromEntries(used.map(j => {
    const g = getSkills(J, null, j, 'All');
    return [j, { n: g.n, m: Object.fromEntries(g.s.map(x => [x.skill, x.count])) }];
  })), [J, used.join('|')]);

  if (!sel.length) return null;

  const val = c => (metric === 'count' ? c : c / total);
  const fmt = v => (metric === 'count' ? Math.round(v).toLocaleString() : Math.round(v * 100) + '%');
  const max = rows.length ? val(rows[0][1]) : 0;
  const axisMax = nice(max * 1.12);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(f => f * axisMax);

  return (
    <div className="card">
      <div className="bc-h">
        <h2>Most Demanded Skills</h2>
        <div className="bc-ctl">
          <label className="bc-top">
            Scope
            <select value={used.length === 1 && sel.length > 1 ? used[0] : 'all'} onChange={e => setScope(e.target.value)}>
              <option value="all">All selected titles</option>
              {sel.map(j => <option key={j} value={j}>{j}</option>)}
            </select>
          </label>
          <div className="bc-seg">
            <button className={metric === 'count' ? 'on' : ''} onClick={() => setMetric('count')}>Postings</button>
            <button className={metric === 'pct' ? 'on' : ''} onClick={() => setMetric('pct')}>% of postings</button>
          </div>
          <label className="bc-top">
            Top
            <select value={topN} onChange={e => setTopN(+e.target.value)}>
              {TOPS.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
        </div>
      </div>

      <p className="note" style={{ marginTop: -6 }}>
        Ranked by number of postings that list the skill, highest first. Percent = those postings &divide; all{' '}
        {total.toLocaleString()} postings of {used.length === 1 ? used[0] : 'the selected titles'}.
        {used.length > 1 && ' Titles with more postings weigh more in this total.'}
      </p>

      <div className="bc">
        {rows.map(([skill, c], i) => {
          const tip = used.map(j => {
            const cj = perJob[j].m[skill] || 0;
            return `${j}: ${cj.toLocaleString()} / ${perJob[j].n.toLocaleString()} (${pct(cj / perJob[j].n)})`;
          }).join('\n');
          return (
            <div className="bc-r" key={skill} title={`${skill}\n${tip}`}>
              <div className="bc-l"><span>{i + 1}</span>{skill}</div>
              <div className="bc-t">
                <i style={{ width: `${(val(c) / axisMax) * 100}%` }} />
                <b>{metric === 'count' ? `${c.toLocaleString()} (${pct(c / total)})` : `${pct(c / total)} (${c.toLocaleString()})`}</b>
              </div>
            </div>
          );
        })}
        <div className="bc-r bc-ax">
          <div className="bc-l" />
          <div className="bc-ticks">
            {ticks.map((t, i) => <span key={i} style={{ left: `${i * 25}%` }}>{fmt(t)}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}