import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';
import NetworkGraph from '../components/NetworkGraph';
import { pct } from '../utils/Utils';
import { summarize } from '../utils/jobInsights';

const SHARES = [[0.25, '25%'], [0.5, '50%'], [0.75, '75%'], [1, '100%']];

function NetworkBody({ data, sel }) {
  const [minS, setMinS] = useState(0.25);
  const sm = summarize(data.J, null, sel, 'All', minS);

  return (
    <>
      <div className="card">
        <div className="top">
          <h2>Job Title &amp; Skill Relationship Network</h2>
          <div className="lg2">
            <span><b style={{ background: 'var(--fam)' }} />Job Family</span>
            <span><b style={{ background: 'var(--job)' }} />Job Title</span>
            <span><b style={{ background: 'var(--sk)' }} />Skill</span>
            <span><b style={{ background: 'none', border: '2px solid var(--sh)' }} />Shared skill</span>
          </div>
        </div>

        <div className="seg">
          <span className="sp">Min share</span>
          {SHARES.map(([v, t]) => (
            <button key={v} className={v === minS ? 'on' : ''} onClick={() => setMinS(v)}>{t}</button>
          ))}
        </div>

        <div className="fnote">
          <b>Active filters:</b> {sel.length} title{sel.length === 1 ? '' : 's'}
          {' '}({sm.postings.toLocaleString()} postings) &middot; min share &ge; {pct(minS)}
          {' '}&rarr; showing <b>{sm.shown}</b> of {sm.total} skills.
          <span>
            Min share = postings of a title that list the skill &divide; all postings of that title.
            A skill is drawn when it reaches this share in at least one selected title;
            line thickness and the % on a highlighted line show that share.
          </span>
        </div>

        <NetworkGraph J={data.J} L={null} sel={sel} level="All" minS={minS} />

        <p className="note">
          Hover a node to compare its links; click to pin the highlight, click empty space to clear.
          Hover a line for the exact count.
        </p>
      </div>

      <Link className="go" to="/skill-stacks">See skill stacks for these titles &rarr;</Link>
    </>
  );
}

export default function JobSkills() {
  return (
    <PageShell title="First Jobber Insight">
      {({ data, sel }) => <NetworkBody data={data} sel={sel} />}
    </PageShell>
  );
}