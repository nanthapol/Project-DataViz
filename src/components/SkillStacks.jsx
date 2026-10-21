import { useMemo, useState } from 'react';
import { pct } from '../utils/Utils';

export default function SkillStacks({ S, sel }) {
  const [pick, setPick] = useState(null);
  const job = sel.includes(pick) ? pick : sel[0];

  const info = useMemo(() => {
    if (!job) return null;
    const stacks = [...S[job]].sort((a, b) => b.postings - a.postings);
    const cnt = new Map();                                   // ทักษะอยู่ในกี่ชุด
    stacks.forEach(s => s.skills.forEach(k => cnt.set(k, (cnt.get(k) || 0) + 1)));
    const core = [...cnt].filter(([, c]) => c === stacks.length).map(([k]) => k);
    const n = stacks.reduce((a, s) => a + s.postings, 0);
    return { stacks, cnt, core, n };
  }, [S, job]);

  if (!job) return null;
  const { stacks, cnt, core, n } = info;
  const k = stacks.length;

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
        <b>{job}</b>: {n.toLocaleString()} postings in {k} stacks.{' '}
        {core.length
          ? <>In every stack: <b>{core.join(', ')}</b>.</>
          : 'No skill appears in every stack.'}
      </p>

      <div className="chip-legend">
        <span><i className="chip core" />In every stack</span>
        <span><i className="chip mid" />In some stacks</span>
        <span><i className="chip uniq" />Only in this stack</span>
      </div>

      {stacks.map((s, i) => {
        const only = s.skills.filter(x => cnt.get(x) === 1);
        return (
          <div className="st-row" key={i}>
            <div className="st-h">
              <b>Stack {i + 1}</b>
              <span>{s.postings.toLocaleString()} of {n.toLocaleString()} postings ({pct(s.postings / n)})</span>
            </div>
            <div className="st-bar"><i style={{ width: `${(s.postings / n) * 100}%` }} /></div>
            <div className="chips">
              {s.skills.map(x => {
                const c = cnt.get(x);
                const cls = c === k ? 'core' : c === 1 ? 'uniq' : 'mid';
                return <span key={x} className={'chip ' + cls} title={`${x}: in ${c} of ${k} stacks`}>{x}</span>;
              })}
            </div>
            <p className="st-only">
              {only.length ? <>Only in this stack: <b>{only.join(', ')}</b></> : 'No skill unique to this stack.'}
            </p>
          </div>
        );
      })}
    </div>
  );
}