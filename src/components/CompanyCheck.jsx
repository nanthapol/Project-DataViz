const SMALL = 1000;   // ตำแหน่งที่ทดสอบได้น้อยกว่านี้ถือว่าตัวอย่างน้อย

export default function CompanyCheck({ C, sel }) {
  if (!sel.length) return null;
  const o = C.overall;
  const nTitles = Object.keys(C.titles).length;
  const rows = sel.map(j => ({ j, t: C.titles[j] })).filter(r => r.t);

  const status = t => {
    if (t.p === null) return 'na';
    if (t.p >= 0.05) return 'none';
    return t.p < C.alpha_corrected ? 'found' : 'weak';
  };

  const reading = t => {
    const r = {
      na: 'Too few companies to test',
      none: 'No evidence of a link between company and stack',
      weak: `Weak signal, not significant after correcting for ${nTitles} titles`,
      found: 'Link found',
    }[status(t)];
    return t.postings < SMALL ? `${r}. Small sample: a weak link could be missed` : r;
  };

  const found = rows.filter(r => status(r.t) === 'found').map(r => r.j);
  const tested = rows.filter(r => status(r.t) !== 'na').length;
  const headline = found.length
    ? `A link between company and stack was found for: ${found.join(', ')}.`
    : tested
      ? 'For the selected titles, the test found no evidence that company decides the stack. This is not proof that there is no effect, especially for small samples.'
      : 'None of the selected titles had enough companies to test.';

  return (
    <div className="card">
      <h2>Does the company decide the skills?</h2>
      <p className="note" style={{ marginTop: -6 }}>
        If companies had their own preferences, each company would favor one stack of a title.
      </p>
      <p className="cc-headline">{headline}</p>

      <p className="note">
        <b>All titles</b> (whole dataset, does not change with your selection)
      </p>
      <div className="cc-stats">
        <div>
          <b>{(o.share_groups_multi_stack * 100).toFixed(1)}%</b>
          <span>of companies that posted the same title 4+ times used 2 or more different stacks
            ({o.groups_ge4.toLocaleString()} company-title pairs)</span>
        </div>
        <div>
          <b>{o.companies.toLocaleString()}</b>
          <span>companies, median {o.median_postings_per_company} posting each; {o.companies_ge10} companies
            with 10+ postings cover {Math.round(o.share_postings_in_companies_ge10 * 100)}% of all postings</span>
        </div>
      </div>

      <p className="note">
        Companies posting a title several times would often land in 2+ stacks even with no preference,
        so the share above does not show a preference on its own. The p-values below are the formal check.
      </p>

      <div className="cc-wrap">
        <table className="cc-t">
          <thead>
            <tr>
              <th>Job title</th>
              <th>Companies tested</th>
              <th>Postings tested<br /><small>(companies with 5+ postings)</small></th>
              <th>p-value</th>
              <th>Reading</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ j, t }) => (
              <tr key={j}>
                <td>{j}</td>
                <td>{t.companies.toLocaleString()}</td>
                <td>
                  {t.postings.toLocaleString()}
                  {t.postings < SMALL && <span className="cc-small"> small n</span>}
                </td>
                <td>{t.p === null ? '-' : t.p.toFixed(3)}</td>
                <td><span className={'cc-badge ' + status(t)}>{reading(t)}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="note">
        Test: do the stacks split differently across companies? The p-value is the chance of seeing a split at least this
        uneven if company had no effect; p &ge; 0.05 means the split looks the same across companies. Only companies with
        5+ postings of the title were tested, and titles with fewer than {SMALL.toLocaleString()} tested postings are flagged
        as small samples. With {nTitles} titles tested at once, a result counts as real only when p &lt; {C.alpha_corrected}.
      </p>
    </div>
  );
}