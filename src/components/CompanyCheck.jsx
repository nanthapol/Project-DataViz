const SMALL = 1000;   // ตำแหน่งที่ทดสอบได้น้อยกว่านี้ถือว่าตัวอย่างน้อย

export default function CompanyCheck({ C, sel }) {
  if (!sel.length) return null;
  const o = C.overall;
  const nTitles = Object.keys(C.titles).length;

  const reading = t => {
    if (t.p === null) return 'Too few companies to test';
    let r;
    if (t.p >= 0.05) r = 'No evidence of a link between company and stack';
    else if (t.p < C.alpha_corrected) r = 'Link found';
    else r = `Weak signal, not significant after correcting for ${nTitles} titles`;
    return t.postings < SMALL ? `${r}. Small sample: a weak link could be missed` : r;
  };

  return (
    <div className="card">
      <h2>Does the company decide the skills?</h2>
      <p className="note" style={{ marginTop: -6 }}>
        If companies had their own preferences, each company would favor one stack of a title.
        The data does not show this.
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
        Even with no company preference, a company posting a title 4 times would land in 2+ stacks about 98% of the time
        (4 stacks of about 25% each). So this figure shows companies do not stick to one stack; the p-values below are the formal check.
      </p>

      <div className="cc-wrap">
        <table className="cc-t">
          <thead>
            <tr><th>Job title</th><th>Companies tested</th><th>Postings</th><th>p-value</th><th>Reading</th></tr>
          </thead>
          <tbody>
            {sel.map(j => {
              const t = C.titles[j];
              return (
                <tr key={j}>
                  <td>{j}</td>
                  <td>{t.companies}</td>
                  <td>{t.postings.toLocaleString()}</td>
                  <td>{t.p === null ? '-' : t.p.toFixed(3)}</td>
                  <td>{reading(t)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="note">
        Test: do the stacks split differently across companies? p-value is the chance of seeing a split this uneven if the
        company had no effect; p &ge; 0.05 means the split looks the same across companies. Only companies with 5+ postings
        of the title were tested, and titles with fewer than {SMALL.toLocaleString()} tested postings are flagged as small samples.
        With {nTitles} titles tested at once, a result counts as real only when p &lt; {C.alpha_corrected}.
      </p>
    </div>
  );
}