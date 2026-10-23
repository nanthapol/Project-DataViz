const SMALL = 1000;

export default function Summary({ S, C, sel }) {
  if (!sel.length) return null;
  const alpha = C.alpha_corrected;
  const nTitles = Object.keys(C.titles).length;

  const verdict = t => {
    if (!t || t.p === null) return 'Too few companies to test whether the company decides the stack.';
    const p = t.p.toFixed(3);
    let r;
    if (t.p >= 0.05) r = `No evidence that the company decides the stack (p = ${p}).`;
    else if (t.p < alpha) r = `The company and the stack appear linked (p = ${p}).`;
    else r = `Weak signal of a company link (p = ${p}), not significant after correcting for ${nTitles} titles.`;
    return t.postings < SMALL
      ? `${r} Small sample (${t.postings.toLocaleString()} postings tested), so a weak link could be missed.`
      : r;
  };

  return (
    <div className="card">
      <h2>At a glance</h2>
      <p className="note" style={{ marginTop: -6 }}>
        Calculated from the selected titles across all companies. The skills in each stack are in the next card.
      </p>

      {sel.map(job => {
        const stacks = S[job];
        const k = stacks.length;
        const n = stacks.reduce((a, s) => a + s.postings, 0);
        const shares = stacks.map(s => s.postings / n);
        const lo = Math.round(Math.min(...shares) * 100);
        const hi = Math.round(Math.max(...shares) * 100);

        return (
          <div className="sm-row" key={job}>
            <b>{job}</b>
            <ul>
              <li>
                {n.toLocaleString()} postings fall into {k} skill stacks,{' '}
                {lo === hi ? `about ${lo}%` : `${lo}% to ${hi}%`} of postings each.
              </li>
              <li>{verdict(C.titles[job])}</li>
            </ul>
          </div>
        );
      })}
    </div>
  );
}