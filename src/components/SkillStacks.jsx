import { useMemo, useState } from 'react';
import { pct } from '../utils/Utils';

const RANK = { core: 0, mid: 1, uniq: 2 };

export default function SkillStacks({ S, sel }) {
  const [pick, setPick] = useState(null);
  const job = sel.includes(pick) ? pick : sel[0];

  const info = useMemo(() => {
    if (!job) return null;
    const stacks = [...S[job]].sort((a, b) => b.postings - a.postings);
    const k = stacks.length;
    const where = new Map();                       // skill -> [index ของชุดที่มี]
    stacks.forEach((s, i) => s.skills.forEach(x => {
      if (!where.has(x)) where.set(x, []);
      where.get(x).push(i);
    }));
    const kind = x => {
      const c = where.get(x).length;
      return c === k ? 'core' : c === 1 ? 'uniq' : 'mid';
    };
    const core = [...where.keys()].filter(x => kind(x) === 'core');
    const uniq = [...where.keys()].filter(x => kind(x) === 'uniq');
    const mid = where.size - core.length - uniq.length;
    const n = stacks.reduce((a, s) => a + s.postings, 0);
    return { stacks, k, where, kind, core, uniqCount: uniq.length, mid, n, total: where.size };
  }, [S, job]);

  if (!job) return null;
  const { stacks, k, where, kind, core, uniqCount, mid, n, total } = info;

  return (
    <div className="card">
      <h2>Skill stacks for the same job title</h2>
      <p className="note" style={{ marginTop: -6 }}>
        Every posting of a title lists one of its skill stacks (a fixed set of skills listed together).
        Comparing the stacks shows how the skills differ within the same title, across all companies.
      </p>

      <div className="tabs">
        {sel.map(j => (
          <button key={j} className={j === job ? 'on' : ''} onClick={() => setPick(j)}>{j}</button>
        ))}
      </div>

      <p className="st-sum">
        <b>{job}</b>: {n.toLocaleString()} postings in {k} stacks, {total} distinct skills.
      </p>

      {/* Insight: คำนวณจากข้อมูลจริง */}
      <div className="insight">
        {k < 2 ? (
          <p>This title has only one stack, so there is nothing to compare.</p>
        ) : (
          <>
            <p>
              All {k} stacks share <b>{core.length}</b> skill{core.length === 1 ? '' : 's'}
              {core.length ? <>: <b>{core.join(', ')}</b></> : ''}.
              {' '}Percentages below are shares of all {n.toLocaleString()} {job} postings.
            </p>
            <p className="insight-sub">
              {stacks.map((s, i) => {
                const only = s.skills.filter(x => kind(x) === 'uniq');
                return (
                  <span key={i}>
                    <b>Stack {i + 1}</b> ({pct(s.postings / n)}): {only.length ? only.join(', ') : 'no unique skill'}
                  </span>
                );
              })}
            </p>
          </>
        )}
      </div>

      <div className="chip-legend">
        <span><i className="chip core" />In every stack ({core.length})</span>
        <span><i className="chip mid" />In some stacks ({mid})</span>
        <span><i className="chip uniq" />Only in one stack ({uniqCount})</span>
      </div>

      {stacks.map((s, i) => {
        const skills = [...s.skills].sort(
          (a, b) => RANK[kind(a)] - RANK[kind(b)] || a.localeCompare(b));
        return (
          <div className="st-row" key={i}>
            <div className="st-h">
              <b>Stack {i + 1}</b>
              <span>{s.postings.toLocaleString()} of {n.toLocaleString()} postings ({pct(s.postings / n)})</span>
            </div>
            <div className="st-bar"><i style={{ width: `${(s.postings / n) * 100}%` }} /></div>
            <div className="chips">
              {skills.map(x => {
                const at = where.get(x);
                const cls = kind(x);
                const label = cls === 'mid' ? `${x} · ${at.length}/${k}` : x;
                const tip = `${x}: in ${at.length} of ${k} stacks (stack ${at.map(v => v + 1).join(', ')})`;
                return <span key={x} className={'chip ' + cls} title={tip}>{label}</span>;
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}